import { NextRequest, NextResponse } from "next/server";

const allowed = ["서울특별시","부산광역시","대구광역시","인천광역시","광주광역시","대전광역시","울산광역시","세종특별자치시","경기도","강원특별자치도","충청북도","충청남도","전북특별자치도","전라남도","경상북도","경상남도","제주특별자치도"];
const domains = ["go.kr","or.kr","lh.or.kr","sh.co.kr","gh.or.kr","myhome.go.kr","youthcenter.go.kr","bokjiro.go.kr","housing.seoul.go.kr"];
type Program = {title:string;agency:string;category:string;region:string;status:string;deadline:string;summary:string;eligibility:string;url:string};
function official(url:string){try{const u=new URL(url);return u.protocol==="https:"&&domains.some(d=>u.hostname===d||u.hostname.endsWith(`.${d}`))}catch{return false}}
export async function POST(request:NextRequest){
 let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:"입력값을 확인해 주세요."},{status:400})}
 const age=Number(body.age),gender=String(body.gender||""),region=String(body.region||""),district=String(body.district||"").trim();
 if(!Number.isInteger(age)||age<14||age>100||!allowed.includes(region)||!["여성","남성","기타 / 응답 안 함"].includes(gender)||district.length>30||(/[<>]/.test(district)))return NextResponse.json({error:"입력값을 확인해 주세요."},{status:400});
 const key=process.env.OPENAI_API_KEY;
 if(!key)return NextResponse.json({error:"OpenAI API 키가 아직 연결되지 않았습니다. 사이트 관리자에게 OPENAI_API_KEY 설정을 요청해 주세요."},{status:503});
 const today=new Date().toLocaleDateString("sv-SE",{timeZone:"Asia/Seoul"});
 const prompt=`오늘은 ${today} (한국 시간). 대한민국의 만 ${age}세, 성별 ${gender}, 거주지 ${region} ${district}인 사용자가 볼 수 있는 현재 접수 중이거나 상시 신청 가능한 청년 지원사업과 주거지원 공고를 공식 기관 사이트에서 웹 검색으로 찾아라. 온통청년(youthcenter.go.kr), 마이홈(myhome.go.kr), 복지로(bokjiro.go.kr), 해당 지자체, LH/SH/GH 등 공식 출처를 우선하라. 전국 사업과 거주지 사업을 함께 포함하고 주거 분야를 우선 찾아라. 공고 원문 또는 해당 사업의 공식 상세 페이지가 확인되고 현재 신청 가능하다는 근거가 있는 것만 최대 12개 반환. 날짜 확인이 안 되면 status에 '접수 확인 필요'라고 적고 추측하지 말 것. 연령 외 소득, 세대, 무주택, 재학, 취업 상태를 모르므로 eligibility는 '추가 요건 확인 필요'를 포함하여 짧게 쓰고 자격 확정 표현 금지. 성별 제한은 공식 공고가 명시할 때만 반영. 각 항목의 url은 검색에서 실제 확인한 공식 https 상세 URL이어야 하며 포털 홈 URL을 만들어 넣지 말 것. 반드시 웹 검색을 사용해 확인하라. 설명 없이 JSON 객체만 반환: {"programs":[{"title":"","agency":"","category":"주거|일자리|교육|금융|복지|기타","region":"","status":"접수 중|상시 신청|접수 확인 필요","deadline":"마감일 또는 상시 또는 원문 확인","summary":"한 문장","eligibility":"짧은 확인 사항","url":"https://..."}]}`;
 try{const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5.5",tools:[{type:"web_search",filters:{allowed_domains:["youthcenter.go.kr","myhome.go.kr","bokjiro.go.kr","gov.kr","go.kr","or.kr","lh.or.kr","sh.co.kr","gh.or.kr"]}}],tool_choice:"required",input:prompt,store:false}),signal:AbortSignal.timeout(110000)});
 if(!response.ok){const raw=await response.text();console.error("OpenAI search failed",response.status,raw.slice(0,300));return NextResponse.json({error:"공고 검색 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요."},{status:502})}
 const data=await response.json() as {output?:Array<{type:string;content?:Array<{type:string;text?:string}>}>;output_text?:string};
 const result=data.output_text||data.output?.flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text||"").join("")||"";
 const cleaned=result.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");
 const parsed=JSON.parse(cleaned) as {programs?:Program[]};
 const programs=(Array.isArray(parsed.programs)?parsed.programs:[]).filter(p=>p&&typeof p.title==="string"&&typeof p.url==="string"&&official(p.url)).slice(0,12).map(p=>({title:p.title.slice(0,130),agency:String(p.agency||"공식 기관").slice(0,80),category:["주거","일자리","교육","금융","복지","기타"].includes(p.category)?p.category:"기타",region:String(p.region||region).slice(0,60),status:["접수 중","상시 신청","접수 확인 필요"].includes(p.status)?p.status:"접수 확인 필요",deadline:String(p.deadline||"원문 확인").slice(0,70),summary:String(p.summary||"").slice(0,230),eligibility:String(p.eligibility||"추가 요건 확인 필요").slice(0,160),url:p.url}));
 return NextResponse.json({programs});
 }catch(err){console.error("Program search error",err);return NextResponse.json({error:"검색 결과를 처리하지 못했습니다. 다시 시도해 주세요."},{status:502})}
}
