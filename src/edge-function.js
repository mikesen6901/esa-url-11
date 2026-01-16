// ESA Edge Function for URL Shortener
// This function handles URL shortening, redirects, and admin operations

const ADMIN_PASSWORD = 'admin123'; // Change this in production
const KV_NAMESPACE = 'url_shortener';

// Initialize Edge KV
const edgeKv = new EdgeKV({ namespace: KV_NAMESPACE });

// Generate random short code
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate random edit token for link management
function generateEditToken(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 调试日志：记录所有请求
  console.log('=== Edge Function Request ===');
  console.log('Path:', path);
  console.log('Method:', request.method);
  console.log('Sec-Fetch-Mode:', request.headers.get('Sec-Fetch-Mode'));
  console.log('User-Agent:', request.headers.get('User-Agent'));

  // 检查是否是导航请求（浏览器地址栏访问或刷新）
  const isNavigationRequest = request.headers.get('Sec-Fetch-Mode') === 'navigate';
  console.log('Is Navigation Request:', isNavigationRequest);

  // 如果是导航请求且不是 API 路径，让静态资源托管处理（SPA fallback）
  if (isNavigationRequest && !path.startsWith('/api')) {
    console.log('✅ Returning 404 for SPA fallback');
    return new Response(null, { status: 404 }); // 返回 404 让 ESA 的 SPA fallback 接管
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Admin authentication check
  function checkAuth(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.substring(7);
    return token === ADMIN_PASSWORD;
  }

  // API: Create short URL
  if (path === '/api/shorten' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { longUrl, customAlias, expiryTime, accessPassword } = body;

      if (!longUrl || !longUrl.startsWith('http')) {
        return new Response(JSON.stringify({ error: '无效的URL' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Generate or use custom alias
      let alias = customAlias;
      if (alias) {
        // Check if custom alias already exists
        const existing = await edgeKv.get(`link:${alias}`);
        if (existing) {
          return new Response(JSON.stringify({ error: '该短码已被使用' }), {
            status: 400,
            headers: corsHeaders
          });
        }
      } else {
        // Generate random alias
        let attempts = 0;
        do {
          alias = generateShortCode();
          const existing = await edgeKv.get(`link:${alias}`);
          if (!existing) break;
          attempts++;
        } while (attempts < 10);

        if (attempts >= 10) {
          return new Response(JSON.stringify({ error: '生成短码失败，请重试' }), {
            status: 500,
            headers: corsHeaders
          });
        }
      }

      // Store link data
      const editToken = generateEditToken();
      const linkData = {
        alias,
        longUrl,
        clicks: 0,
        createdAt: new Date().toISOString(),
        expiresAt: expiryTime > 0 ? new Date(Date.now() + expiryTime * 1000).toISOString() : null,
        editToken,
        accessPassword: accessPassword || null
      };

      await edgeKv.put(`link:${alias}`, JSON.stringify(linkData));

      // Add to links list
      let linksList = await edgeKv.get('links_list');
      linksList = linksList ? JSON.parse(linksList) : [];
      linksList.push(alias);
      await edgeKv.put('links_list', JSON.stringify(linksList));

      const shortUrl = `${url.origin}/${alias}`;

      return new Response(JSON.stringify({
        success: true,
        shortUrl,
        alias,
        longUrl,
        editToken
      }), {
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: '服务器错误' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // API: Get link statistics
  if (path.startsWith('/api/stats/') && request.method === 'GET') {
    try {
      const alias = path.split('/').pop();
      const linkData = await edgeKv.get(`link:${alias}`);

      if (!linkData) {
        return new Response(JSON.stringify({ error: '短链接不存在' }), {
          status: 404,
          headers: corsHeaders
        });
      }

      const link = JSON.parse(linkData);

      return new Response(JSON.stringify(link), {
        headers: corsHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: '查询失败' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // API: Update short URL
  if (path.startsWith('/api/update/') && request.method === 'PUT') {
    try {
      const alias = path.split('/').pop();
      const body = await request.json();
      const { longUrl, editToken } = body;

      if (!longUrl || !longUrl.startsWith('http')) {
        return new Response(JSON.stringify({ error: '无效的URL' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const linkData = await edgeKv.get(`link:${alias}`);

      if (!linkData) {
        return new Response(JSON.stringify({ error: '短链接不存在' }), {
          status: 404,
          headers: corsHeaders
        });
      }

      const link = JSON.parse(linkData);

      // Verify edit token
      if (link.editToken !== editToken) {
        return new Response(JSON.stringify({ error: '管理密钥错误' }), {
          status: 403,
          headers: corsHeaders
        });
      }

      // Update the long URL
      link.longUrl = longUrl;
      link.updatedAt = new Date().toISOString();

      await edgeKv.put(`link:${alias}`, JSON.stringify(link));

      return new Response(JSON.stringify({
        success: true,
        message: '短链接已更新'
      }), {
        headers: corsHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: '更新失败' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // API: Verify access password
  if (path.startsWith('/api/verify/') && request.method === 'POST') {
    try {
      const alias = path.split('/').pop();
      const body = await request.json();
      const { password } = body;

      const linkData = await edgeKv.get(`link:${alias}`);

      if (!linkData) {
        return new Response(JSON.stringify({ error: '短链接不存在' }), {
          status: 404,
          headers: corsHeaders
        });
      }

      const link = JSON.parse(linkData);

      // Check if password matches
      if (link.accessPassword && link.accessPassword === password) {
        return new Response(JSON.stringify({
          success: true,
          longUrl: link.longUrl
        }), {
          headers: corsHeaders
        });
      } else {
        return new Response(JSON.stringify({ error: '密码错误' }), {
          status: 403,
          headers: corsHeaders
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: '验证失败' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // API: Admin login
  if (path === '/api/admin/login' && request.method === 'POST') {
    try {
      const body = await request.json();
      if (body.password === ADMIN_PASSWORD) {
        return new Response(JSON.stringify({
          success: true,
          token: ADMIN_PASSWORD
        }), {
          headers: corsHeaders
        });
      } else {
        return new Response(JSON.stringify({ error: '密码错误' }), {
          status: 401,
          headers: corsHeaders
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: '登录失败' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // API: Get all links (admin only)
  if (path === '/api/admin/links' && request.method === 'GET') {
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: '未授权' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    try {
      let linksList = await edgeKv.get('links_list');
      linksList = linksList ? JSON.parse(linksList) : [];

      const links = [];
      for (const alias of linksList) {
        const linkData = await edgeKv.get(`link:${alias}`);
        if (linkData) {
          links.push(JSON.parse(linkData));
        }
      }

      return new Response(JSON.stringify({ links }), {
        headers: corsHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: '获取链接失败' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // API: Delete link (admin only)
  if (path.startsWith('/api/admin/links/') && request.method === 'DELETE') {
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: '未授权' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    try {
      const alias = path.split('/').pop();
      await edgeKv.delete(`link:${alias}`);

      // Remove from links list
      let linksList = await edgeKv.get('links_list');
      linksList = linksList ? JSON.parse(linksList) : [];
      linksList = linksList.filter(a => a !== alias);
      await edgeKv.put('links_list', JSON.stringify(linksList));

      return new Response(JSON.stringify({ success: true }), {
        headers: corsHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: '删除失败' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // Handle short URL redirects (exclude /admin for SPA routing)
  if (path.length > 1 && !path.startsWith('/api') && !path.startsWith('/assets') && path !== '/admin') {
    const alias = path.substring(1);

    try {
      const linkData = await edgeKv.get(`link:${alias}`);

      if (linkData) {
        const link = JSON.parse(linkData);

        // Check if link has expired
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
          return new Response('链接已过期', {
            status: 410,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }

        // Check if link has password protection
        if (link.accessPassword) {
          // If password protected, redirect to password verification page
          return new Response(null, {
            status: 302,
            headers: {
              'Location': `/#/verify/${alias}`,
              'Cache-Control': 'no-cache'
            }
          });
        }

        // Increment click count
        link.clicks = (link.clicks || 0) + 1;
        await edgeKv.put(`link:${alias}`, JSON.stringify(link));

        // Redirect to long URL
        return new Response(null, {
          status: 302,
          headers: {
            'Location': link.longUrl,
            'Cache-Control': 'no-cache'
          }
        });
      }
    } catch (error) {
      console.error('Redirect error:', error);
    }
  }

  // For unmatched routes, return null response to let ESA's SPA fallback handle it
  // This allows notFoundStrategy: "singlePageApplication" to serve index.html
  return fetch(request);
}

export default {
  async fetch(request) {
    return handleRequest(request);
  }
};
