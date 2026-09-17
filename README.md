# Suz — Backend & AI Engineer Portfolio

화이트 바탕에 은은한 블루·퍼플, 노란색 포인트를 사용한 반응형 포트폴리오입니다. 프레임워크 없이 HTML, CSS, JavaScript만으로 만들었으며 사용자 이벤트 → 상태 변경 → DOM 렌더링 흐름을 명확히 분리했습니다.

## 주요 기능

- 모바일 우선 반응형 레이아웃(768px, 1024px 분기)
- 햄버거 메뉴, 부드러운 앵커 이동, 스크롤 헤더/맨 위로 버튼
- 시스템 테마 자동 감지와 `localStorage` 기반 다크 모드 유지
- Intersection Observer 등장 애니메이션과 Hero 타이핑 효과
- GitHub REST API 프로젝트 로딩 및 로딩/성공/빈 결과/오류 상태 UI
- `Array.map()` 기반 프로젝트 카드, `Array.filter()` 기반 언어 필터
- 문의 폼 실시간 필수값·이메일 유효성 검사

## 프로젝트 구조

```text
.
├── index.html
├── css/style.css
├── js/app.js
└── images/profile.svg
```

## 실행 방법

별도의 빌드 과정이나 패키지 설치가 없습니다. VS Code Live Server로 `index.html`을 열거나 정적 서버를 실행하세요.

```bash
python -m http.server 5500
```

`http://localhost:5500`에서 확인할 수 있습니다.

## GitHub API 설정

GitHub Pages 환경에서는 호스트 이름에서 GitHub 사용자명을 자동으로 가져옵니다.
로컬 환경에서는 API 연동 전에도 프로젝트 카드 UI를 확인할 수 있도록
`octocat` 저장소를 fallback 샘플 데이터로 사용합니다.

인증 없는 GitHub API는 시간당 호출 횟수가 제한되며, 403을 포함한 실패 응답은 오류 UI와 다시 시도 버튼으로 처리됩니다.

## 구현 기준

- Flexbox: 내비게이션과 한 방향 정렬 요소에 사용
- Grid: 프로젝트 카드, 스킬, 큰 섹션처럼 행과 열을 함께 제어하는 레이아웃에 사용
- 스크롤 기준: 헤더 스타일 60px, 맨 위로 버튼 300px
- Intersection Observer threshold: 0.2
- 인라인 스타일 및 HTML 이벤트 속성 없이 `addEventListener`로 이벤트 연결
- `prefers-reduced-motion` 사용자의 애니메이션 최소화 설정 지원

## 배포

GitHub 저장소의 **Settings → Pages**에서 배포 브랜치와 루트 폴더를 선택하면 됩니다.

- 저장소 URL: 배포 후 입력
- 배포 URL: 배포 후 입력
- 스크린샷: 데스크톱/모바일/다크 모드 캡처 후 `images/`에 추가
