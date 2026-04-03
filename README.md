# 📚 Word Practice (영단어 학습 웹앱)

> 텍스트 기반 단어 데이터를 업로드하면  
> 자동으로 **단어 카드(Flash Card)** 형태로 변환하여 학습할 수 있는 웹 애플리케이션

---

## 🔥 프로젝트 소개

이 프로젝트는 단순한 단어 암기를 넘어서  
사용자가 직접 입력한 데이터를 기반으로 **퀴즈형 학습 경험**을 제공하기 위해 개발되었습니다.

✔ 텍스트 → 단어 카드 자동 변환  
✔ 잘못된 입력 데이터 검증  
✔ 직관적인 카드 UI 제공  

---

## 🛠 기술 스택

### Backend
- Java 17
- Spring Boot
- Gradle
- REST API

### Frontend
- HTML / CSS / JavaScript (Vanilla)
- Thymeleaf

---

## ⚙️ 주요 기능

### 1️⃣ 단어 데이터 파싱
- 사용자가 입력한 텍스트를 분석하여
- **단어 카드 형태로 변환**
```bash
apple - 사과
banana - 바나나
```

## 🖥 실행 방법
프로젝트 실행
```bash
./gradlew bootRun
```
👉 접속
```bash
http://localhost:8080
```
