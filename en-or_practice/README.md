# 영어 퀴즈 & 플래시카드 메이커

원래 단일 HTML로 만들었던 단어 연습 페이지를 스프링 부트 프로젝트로 정리한 버전입니다.

입력한 `영어 + 한국어 뜻` 문장을 기준으로

- 퀴즈 만들기
- 플래시카드 학습
- 오답 다시 풀기
- 입력 형식 미리보기

까지 한 번에 할 수 있게 구성했습니다.

## 기술 스택

- Java 17
- Spring Boot 3.5.13
- Spring MVC
- Thymeleaf
- Vanilla JavaScript
- CSS

## 프로젝트 구조

```text
word-practice-spring
├─ build.gradle
├─ src
│  ├─ main
│  │  ├─ java/com/dailyword/wordpractice
│  │  │  ├─ WordPracticeApplication.java
│  │  │  ├─ web/HomeController.java
│  │  │  └─ quiz
│  │  │     ├─ WordCardApiController.java
│  │  │     ├─ WordCardService.java
│  │  │     └─ dto
│  │  └─ resources
│  │     ├─ templates/index.html
│  │     ├─ static/css/style.css
│  │     └─ static/js/app.js
│  └─ test
│     └─ java/com/dailyword/wordpractice/quiz/WordCardServiceTest.java
└─ legacy/word-practice-single-file.html
```

## 실행 방법

### 1) 프로젝트 실행

```bash
gradle bootRun
```

실행 후 브라우저에서 아래 주소로 접속하면 됩니다.

```text
http://localhost:8080
```

### 2) 테스트 실행

```bash
gradle test
```

## 구현 포인트

### 1. 단일 HTML → 스프링 구조로 분리

원래 한 파일에 들어 있던 내용을 아래처럼 나눴습니다.

- 화면: `templates/index.html`
- 스타일: `static/css/style.css`
- 동작: `static/js/app.js`
- 입력 파싱: `WordCardService`
- API: `WordCardApiController`

### 2. Spring을 실제로 쓰는 부분

입력한 텍스트를 브라우저에서 바로 대충 자르지 않고,
`/api/cards/parse` 요청으로 서버에서 형식을 검사해서 미리보기 카드 수와 잘못된 줄을 돌려주게 만들었습니다.

### 3. 원래 만들었던 느낌은 유지

너무 과하게 백엔드 프로젝트처럼 만들기보다,
기존 HTML에서 쓰던 퀴즈 흐름과 플래시카드 UI를 그대로 살리고 구조만 정리했습니다.

## 깃허브 업로드 예시

```bash
git init
git add .
git commit -m "feat: spring boot version of word practice app"
git branch -M main
git remote add origin <본인_깃허브_레포_URL>
git push -u origin main
```

## 메모

- `legacy` 폴더에는 원래 단일 HTML 파일을 같이 넣어뒀습니다.
- 나중에 원하면 DB 저장, 로그인, 오답노트, 관리자 페이지 쪽으로도 확장 가능합니다.
