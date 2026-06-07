// ===================================================================
//  Decap CMS GitHub 로그인용 Cloudflare Worker
//  관리자 화면(/admin)에서 "GitHub로 로그인"을 눌렀을 때 인증을 처리합니다.
//
//  배포 후 Cloudflare 대시보드에서 아래 2개의 환경변수(Secret)를 등록하세요:
//    GITHUB_CLIENT_ID      (GitHub OAuth App 의 Client ID)
//    GITHUB_CLIENT_SECRET  (GitHub OAuth App 의 Client Secret)
// ===================================================================

const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1단계: /auth -> GitHub 로그인 페이지로 보냄
    if (url.pathname === "/auth") {
      const redirect = `${url.origin}/callback`;
      const authUrl = new URL(GITHUB_AUTHORIZE);
      authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", redirect);
      authUrl.searchParams.set("scope", "repo,user");
      authUrl.searchParams.set("state", crypto.randomUUID());
      return Response.redirect(authUrl.toString(), 302);
    }

    // 2단계: /callback -> 코드를 토큰으로 교환하고 CMS 창으로 전달
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("코드가 없습니다.", { status: 400 });

      const tokenRes = await fetch(GITHUB_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const data = await tokenRes.json();
      const content = data.access_token
        ? { token: data.access_token, provider: "github" }
        : { error: data.error_description || "인증 실패" };
      const status = data.access_token ? "success" : "error";

      // 부모 창(CMS)에게 결과를 postMessage 로 전달
      const body = `<!DOCTYPE html><html><body><script>
        (function () {
          function send(e) {
            window.opener.postMessage(
              'authorization:github:${status}:' + JSON.stringify(${JSON.stringify(content)}),
              e.origin
            );
          }
          window.addEventListener('message', send, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script><p>로그인 처리 중… 이 창은 자동으로 닫힙니다.</p></body></html>`;

      return new Response(body, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return new Response("Decap CMS OAuth Worker 정상 작동 중입니다.", {
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
    });
  },
};
