# 학원 홍보 랜딩페이지

Cloudflare Pages(무료·빠름) + 관리자 화면(Decap CMS)으로 만든 학원 홍보 사이트입니다.
**한 번만 세팅하면, 이후엔 코드를 만질 필요 없이 `사이트주소/admin` 에서 사진과 글자를 바꿀 수 있습니다.**

---

## 📁 폴더 구조

```
coll/
├─ public/                 ← 실제 웹사이트 (Cloudflare에 올라가는 부분)
│  ├─ index.html           ← 랜딩페이지 (디자인·구조)
│  ├─ content/content.json ← 사이트 내용 (관리자 화면이 이 파일을 수정함)
│  ├─ admin/               ← 관리자 화면 (Decap CMS)
│  │  ├─ index.html
│  │  └─ config.yml        ← ★ 배포 전 2곳 수정 필요
│  └─ images/uploads/      ← 업로드한 사진이 저장되는 곳
└─ oauth-worker/           ← 관리자 로그인 처리용 Cloudflare Worker
   ├─ worker.js
   └─ wrangler.toml
```

---

## 🚀 처음 한 번만 하는 세팅 (약 20~30분)

> 필요한 계정 2개 (둘 다 무료): **GitHub**, **Cloudflare**

### 1. GitHub에 코드 올리기
1. https://github.com 가입 → 새 저장소(New repository) 생성 (예: `academy-site`)
2. 이 `coll` 폴더 전체를 그 저장소에 올립니다.
   - 가장 쉬운 방법: [GitHub Desktop](https://desktop.github.com) 설치 → 저장소를 폴더로 연결 → Commit & Push
   - (제가 도와드릴 수도 있어요)

### 2. Cloudflare Pages로 사이트 배포
1. https://dash.cloudflare.com 가입 → **Workers & Pages → Create → Pages → Connect to Git**
2. 방금 만든 GitHub 저장소 선택
3. 빌드 설정:
   - **Framework preset**: None
   - **Build command**: (비워둠)
   - **Build output directory**: `public`
4. Deploy 클릭 → `학원이름.pages.dev` 주소가 생깁니다. ✅ **여기까지 하면 사이트는 이미 작동합니다.**

### 3. 관리자 로그인 만들기 (사진을 화면에서 바꾸기 위함)

**(a) GitHub OAuth App 등록**
1. GitHub → Settings → Developer settings → **OAuth Apps → New OAuth App**
2. 입력:
   - Homepage URL: `https://학원이름.pages.dev`
   - Authorization callback URL: `https://academy-auth.본인계정.workers.dev/callback`
     (워커 주소는 아래 (b)에서 확정됩니다. 일단 임시로 적고 나중에 수정해도 됩니다)
3. 생성 후 **Client ID** 와 **Client Secret(Generate)** 을 메모

**(b) 인증 워커 배포**
PowerShell에서 `oauth-worker` 폴더로 이동 후:
```powershell
cd oauth-worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put GITHUB_CLIENT_ID       # 위에서 받은 Client ID 붙여넣기
npx wrangler secret put GITHUB_CLIENT_SECRET   # 위에서 받은 Client Secret 붙여넣기
```
배포되면 `https://academy-auth.본인계정.workers.dev` 주소가 나옵니다.
→ 이 주소를 (a)의 callback URL 에도 정확히 맞춰주세요.

**(c) config.yml 2곳 수정**
`public/admin/config.yml` 을 열어:
```yaml
    repo: GITHUB_사용자명/저장소이름       # → 본인 것으로
    base_url: https://OAUTH_워커_주소       # → 위 워커 주소로
```
수정 후 다시 GitHub에 push → Cloudflare가 자동 재배포합니다.

---

## ✏️ 평소 사용법 (운영자분이 하는 일은 이게 전부)

1. `https://학원이름.pages.dev/admin` 접속
2. **GitHub로 로그인**
3. 원하는 항목 클릭 → 글자 수정 / 사진은 드래그&드롭으로 교체
4. 오른쪽 위 **Publish(게시)** 클릭
5. 1~2분 뒤 실제 사이트에 자동 반영 ✨

> 코드, 파일, 폴더 — 아무것도 안 만져도 됩니다.

---

## 🔧 미리보기 (배포 전 내 컴퓨터에서 확인)

PowerShell에서:
```powershell
cd public
python -m http.server 8000
```
브라우저에서 http://localhost:8000 접속
(파이썬이 없으면 알려주세요. 다른 방법으로 띄워드릴게요.)
