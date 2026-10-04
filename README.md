# 모아청년
<img src=moa.png>
나이, 성별, 거주지를 입력하면 대한민국 청년 지원사업과 주거지원 공고를 한 화면에서 찾아보는 웹 서비스입니다.

## 기능

- 전국 및 거주 지역의 청년 정책과 주거지원 정보 검색
- 주거·일자리·교육·금융·복지 분야별 결과 보기
- 공식 공고 링크, 접수 상태, 신청 자격 추가 확인 사항 표시
- OpenAI Responses API의 웹 검색을 이용한 실시간 요약

> AI가 공고를 요약하므로 결과가 누락되거나 부정확할 수 있습니다. 신청 기간과 자격 요건은 반드시 링크된 공식 공고문에서 다시 확인하세요. 정부 또는 지자체의 공식 서비스가 아닙니다.

## 로컬 실행

Node.js 22 이상이 필요합니다.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Windows PowerShell에서는 `cp .env.example .env.local` 대신 `Copy-Item .env.example .env.local`을 사용해도 됩니다. `.env.local`의 `OPENAI_API_KEY`를 본인의 키로 바꾼 뒤 `http://localhost:3000`을 여세요. API 키는 브라우저가 아닌 서버에서만 사용하며 Git에 올리지 마세요.

## 사용 기술

Next.js, React, TypeScript, Tailwind CSS, OpenAI Responses API (`web_search`)

## 비용과 데이터

검색할 때 OpenAI 모델 및 웹 검색 API 사용 요금이 발생할 수 있습니다. 개인 프로필은 저장하지 않으며 검색 요청 처리에만 사용합니다. 키가 없으면 화면은 열리지만 공고 검색은 실행되지 않습니다.

## 참고

- [온통청년](https://www.youthcenter.go.kr/)
- [마이홈](https://www.myhome.go.kr/)
- [OpenAI 웹 검색 문서](https://developers.openai.com/api/docs/guides/tools-web-search)
