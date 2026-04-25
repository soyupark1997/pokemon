import "./style.css";
import { addRoute, startRouter } from "./utils/router";
import { renderLogin } from "./pages/login";
import { renderSignup } from "./pages/signup";
import { renderPostList } from "./pages/postList";
import { renderPostDetail } from "./pages/postDetails";
import { renderPostWrite } from "./pages/postWrite";
import { renderPostEdit } from "./pages/postEdit";

// 라우트 등록
addRoute("/login", renderLogin);
addRoute("/signup", renderSignup);
addRoute("/posts", renderPostList);
addRoute("/posts/write", renderPostWrite);
addRoute("/posts/:id", renderPostDetail);
addRoute("/posts/:id/edit", renderPostEdit);

// 라우터 시작
startRouter();
