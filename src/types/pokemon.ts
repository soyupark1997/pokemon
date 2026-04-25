import { login } from "../utils/api";
import { navigate } from "../utils/router";

export function renderLogin(): void {
  const app = document.getElementById("app") as HTMLDivElement;
  app.innerHTML = `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">로그인</h1>
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input type="text" id="username" placeholder="아이디를 입력하세요"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input type="password" id="password" placeholder="비밀번호를 입력하세요"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div id="error-msg" class="text-red-500 text-sm hidden"></div>
          <button type="submit"
            class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium">
            로그인
          </button>
        </form>
        <p class="text-center text-sm text-gray-500 mt-4">
          계정이 없으신가요?
          <a href="#/signup" class="text-blue-500 hover:underline">회원가입</a>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById("login-form") as HTMLFormElement;
  form.addEventListener("submit", async (e: Event) => {
    e.preventDefault();
    const username = (
      document.getElementById("username") as HTMLInputElement
    ).value.trim();
    const password = (
      document.getElementById("password") as HTMLInputElement
    ).value.trim();
    const errorMsg = document.getElementById("error-msg") as HTMLDivElement;

    if (!username || !password) {
      errorMsg.textContent = "아이디와 비밀번호를 입력하세요.";
      errorMsg.classList.remove("hidden");
      return;
    }

    try {
      await login(username, password);
      navigate("/posts");
    } catch (err) {
      errorMsg.textContent = (err as Error).message;
      errorMsg.classList.remove("hidden");
    }
  });
}
