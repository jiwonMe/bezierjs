# Kirb 프로젝트 구조

## 📁 디렉토리 구조

```
kirb/
├── 📄 공개 문서 (필수)
│   ├── README.md           # 메인 문서
│   ├── CHANGELOG.md        # 변경 이력
│   ├── LICENSE.md          # MIT 라이선스
│   └── FUNDING.md          # 펀딩 정보
│
├── 📦 소스 코드
│   ├── src/
│   │   ├── bezier.js       # 메인 export
│   │   ├── utils.js        # 유틸리티 export
│   │   │
│   │   ├── bezier/         # Bezier 클래스 모듈
│   │   │   ├── core.js         # 생성자 및 기본 메서드 (276줄)
│   │   │   ├── poly-bezier.js  # 다중 곡선 클래스 (71줄)
│   │   │   ├── lookup.js       # LUT, 검색 메서드 (220줄)
│   │   │   ├── geometry.js     # 기하 연산 (205줄)
│   │   │   ├── offset.js       # 오프셋, 스케일 (299줄)
│   │   │   ├── intersection.js # 교차 계산 (78줄)
│   │   │   └── arcs.js         # 원호 근사 (112줄)
│   │   │
│   │   └── utils/          # 유틸리티 함수
│   │       ├── constants.js    # 상수 (101줄)
│   │       ├── errors.js       # 에러 클래스 (28줄) ✨
│   │       ├── compute.js      # 곡선 계산 (189줄)
│   │       ├── geometry.js     # 기하 유틸 (176줄)
│   │       ├── roots.js        # 다항식 근 (231줄)
│   │       ├── intersection.js # 교차 헬퍼 (245줄)
│   │       └── shape.js        # 도형 생성 (50줄)
│
├── 🧪 테스트
│   └── test/
│       ├── functionality/      # 기능 테스트 (6개)
│       ├── general/           # 일반 테스트 (4개)
│       └── api-improvements.test.js  # 새 API 테스트 ✨
│
├── 📦 빌드 산출물
│   └── dist/
│       ├── kirb.js            # 22.2KB (브라우저용)
│       └── kirb.cjs           # 44KB (Node.js용)
│
├── 🌐 문서 사이트
│   └── docs/                  # GitHub Pages
│
├── 🔧 개발 문서 (git/npm에서 제외)
│   └── .dev-docs/
│       ├── README.md
│       ├── API_IMPROVEMENTS.md
│       ├── API_ANALYSIS_SUMMARY.md
│       ├── IMPLEMENTATION_EXAMPLES.md
│       ├── IMPROVEMENTS_APPLIED.md
│       └── PUBLISH_GUIDE.md
│
└── ⚙️ 설정 파일
    ├── package.json
    ├── .gitignore
    ├── .npmignore
    └── pnpm-lock.yaml
```

---

## 📊 파일 통계

### 소스 코드
- **총 줄 수**: 2,287줄
- **파일 수**: 15개
- **평균**: ~152줄/파일
- **최대**: 299줄 (offset.js)
- **전부 300줄 이하** ✅

### 테스트
- **테스트 스위트**: 11개
- **테스트 케이스**: 48개
- **성공률**: 100% ✅

### 문서
- **공개 문서**: 4개 (README, CHANGELOG, LICENSE, FUNDING)
- **개발 문서**: 6개 (.dev-docs/)

---

## 🔒 무시 설정

### .gitignore
```gitignore
node_modules/
.dev-docs/          # 개발 문서 제외
dist/               # 빌드 결과물 제외 (CI에서 생성)
coverage/
.DS_Store
.vscode/
.idea/
*.log
```

### .npmignore
```npmignore
test/               # 테스트 제외
docs/               # 문서 사이트 제외
.dev-docs/          # 개발 문서 제외
.github/
.git/

# npm 패키지에 포함될 것
✅ dist/
✅ src/
✅ README.md
✅ CHANGELOG.md
✅ LICENSE.md
✅ FUNDING.md
```

---

## 📦 npm 패키지 구조

배포 시 포함되는 내용:

```
kirb@1.1.0/
├── dist/
│   ├── kirb.js      # 22.2KB
│   └── kirb.cjs     # 44KB
├── src/             # 전체 소스 (모듈별로 import 가능)
├── README.md
├── CHANGELOG.md
├── LICENSE.md
├── FUNDING.md
└── package.json

크기: ~40KB (압축)
```

---

## 🎯 깔끔하게 정리된 구조!

- ✅ 공개 문서만 루트에
- ✅ 개발 문서는 .dev-docs/
- ✅ git/npm에서 적절히 제외
- ✅ 명확한 역할 분리

