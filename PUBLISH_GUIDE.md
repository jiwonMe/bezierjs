# kirb 배포 가이드

## 📋 배포 전 체크리스트

- [ ] npm 계정 로그인 확인
- [ ] GitHub 저장소 생성 (jiwonMe/kirb)
- [ ] 테스트 통과 확인
- [ ] 빌드 완료 확인
- [ ] README.md 확인

## 🚀 배포 단계

### 1. npm 로그인
\`\`\`bash
npm login
\`\`\`

### 2. 테스트 실행
\`\`\`bash
pnpm test
\`\`\`

### 3. 빌드
\`\`\`bash
pnpm run build
\`\`\`

### 4. 배포 전 dry-run
\`\`\`bash
npm publish --dry-run
\`\`\`

### 5. 실제 배포
\`\`\`bash
npm publish
\`\`\`

## 📝 버전 업데이트

### Patch (1.0.0 → 1.0.1)
\`\`\`bash
npm version patch
npm publish
\`\`\`

### Minor (1.0.0 → 1.1.0)
\`\`\`bash
npm version minor
npm publish
\`\`\`

### Major (1.0.0 → 2.0.0)
\`\`\`bash
npm version major
npm publish
\`\`\`

## 🔗 배포 후 확인

1. https://www.npmjs.com/package/kirb 접속
2. 설치 테스트:
   \`\`\`bash
   npm install kirb
   \`\`\`
3. 사용 테스트:
   \`\`\`javascript
   import { Bezier } from 'kirb';
   const curve = new Bezier(0, 0, 100, 100);
   console.log(curve.length());
   \`\`\`

## 🎯 홍보

- [ ] GitHub Release 작성
- [ ] Twitter/X 공유
- [ ] Reddit r/javascript 공유
- [ ] Dev.to 글 작성
