export const JOB_PREFIX_MAP: Record<string, number> = {
  검성: 11,
  수호성: 12,
  살성: 13,
  궁성: 14,
  마도성: 15,
  정령성: 16,
  치유성: 17,
  호법성: 18,
};

export interface SkillInfo {
  code: number;
  name: string;
  isStigma?: boolean;
}

export const SKILL_DATA: SkillInfo[] = [
  {
    "code": 11020000,
    "name": "예리한 일격",
    "isStigma": false
  },
  {
    "code": 11010000,
    "name": "절단의 맹타",
    "isStigma": false
  },
  {
    "code": 11190000,
    "name": "도약 찍기",
    "isStigma": false
  },
  {
    "code": 11290000,
    "name": "유린의 검",
    "isStigma": false
  },
  {
    "code": 11170000,
    "name": "내려찍기",
    "isStigma": false
  },
  {
    "code": 11280000,
    "name": "검기 난무",
    "isStigma": false
  },
  {
    "code": 11200000,
    "name": "발목 베기",
    "isStigma": false
  },
  {
    "code": 11050000,
    "name": "분쇄 파동",
    "isStigma": false
  },
  {
    "code": 11360000,
    "name": "돌진 일격",
    "isStigma": false
  },
  {
    "code": 11300000,
    "name": "공중 결박",
    "isStigma": false
  },
  {
    "code": 11100000,
    "name": "파멸의 맹타",
    "isStigma": false
  },
  {
    "code": 11260000,
    "name": "충격 해제",
    "isStigma": false
  },
  {
    "code": 11710000,
    "name": "생존 자세",
    "isStigma": false
  },
  {
    "code": 11720000,
    "name": "보호의 갑옷",
    "isStigma": false
  },
  {
    "code": 11730000,
    "name": "피의 흡수",
    "isStigma": false
  },
  {
    "code": 11740000,
    "name": "약점 파악",
    "isStigma": false
  },
  {
    "code": 11750000,
    "name": "공격 준비",
    "isStigma": false
  },
  {
    "code": 11760000,
    "name": "충격 적중",
    "isStigma": false
  },
  {
    "code": 11770000,
    "name": "파괴 충동",
    "isStigma": false
  },
  {
    "code": 11780000,
    "name": "노련한 반격",
    "isStigma": false
  },
  {
    "code": 11790000,
    "name": "생존 의지",
    "isStigma": false
  },
  {
    "code": 11800000,
    "name": "살기 파열",
    "isStigma": false
  },
  {
    "code": 11240000,
    "name": "분노의 파동",
    "isStigma": true
  },
  {
    "code": 11400000,
    "name": "돌격 자세",
    "isStigma": true
  },
  {
    "code": 11250000,
    "name": "지켈의 축복",
    "isStigma": true
  },
  {
    "code": 11110000,
    "name": "집중 막기",
    "isStigma": true
  },
  {
    "code": 11130000,
    "name": "균형의 갑옷",
    "isStigma": true
  },
  {
    "code": 11080000,
    "name": "칼날 날리기",
    "isStigma": true
  },
  {
    "code": 11380000,
    "name": "근성",
    "isStigma": true
  },
  {
    "code": 11340000,
    "name": "흡혈의 검",
    "isStigma": true
  },
  {
    "code": 11390000,
    "name": "격노 폭발",
    "isStigma": true
  },
  {
    "code": 11410000,
    "name": "파동의 갑주",
    "isStigma": true
  },
  {
    "code": 11430000,
    "name": "강제 결박",
    "isStigma": true
  },
  {
    "code": 11700000,
    "name": "강습 일격",
    "isStigma": true
  },
  {
    "code": 11450000,
    "name": "분쇄 돌진",
    "isStigma": true
  },
  {
    "code": 14020000,
    "name": "저격",
    "isStigma": false
  },
  {
    "code": 14340000,
    "name": "속사",
    "isStigma": false
  },
  {
    "code": 14130000,
    "name": "올가미 화살",
    "isStigma": false
  },
  {
    "code": 14090000,
    "name": "표적 화살",
    "isStigma": false
  },
  {
    "code": 14050000,
    "name": "송곳 화살",
    "isStigma": false
  },
  {
    "code": 14330000,
    "name": "화살 난사",
    "isStigma": false
  },
  {
    "code": 14110000,
    "name": "광풍 화살",
    "isStigma": false
  },
  {
    "code": 14170000,
    "name": "폭발의 덫",
    "isStigma": false
  },
  {
    "code": 14080000,
    "name": "파열 화살",
    "isStigma": false
  },
  {
    "code": 14070000,
    "name": "제압 화살",
    "isStigma": false
  },
  {
    "code": 14010000,
    "name": "조준 화살",
    "isStigma": false
  },
  {
    "code": 14260000,
    "name": "충격 해제",
    "isStigma": false
  },
  {
    "code": 14710000,
    "name": "경계의 눈",
    "isStigma": false
  },
  {
    "code": 14720000,
    "name": "집중 포화",
    "isStigma": false
  },
  {
    "code": 14730000,
    "name": "바람의 활력",
    "isStigma": false
  },
  {
    "code": 14740000,
    "name": "집중의 눈",
    "isStigma": false
  },
  {
    "code": 14750000,
    "name": "사냥꾼의 결의",
    "isStigma": false
  },
  {
    "code": 14760000,
    "name": "저항의 결의",
    "isStigma": false
  },
  {
    "code": 14770000,
    "name": "속박의 눈",
    "isStigma": false
  },
  {
    "code": 14780000,
    "name": "근접 사격",
    "isStigma": false
  },
  {
    "code": 14790000,
    "name": "회생의 계약",
    "isStigma": false
  },
  {
    "code": 14800000,
    "name": "사냥꾼의 혼",
    "isStigma": false
  },
  {
    "code": 14270000,
    "name": "화살 폭풍",
    "isStigma": true
  },
  {
    "code": 14310000,
    "name": "바이젤의 권능",
    "isStigma": true
  },
  {
    "code": 14220000,
    "name": "축복의 활",
    "isStigma": true
  },
  {
    "code": 14120000,
    "name": "기습 차기",
    "isStigma": true
  },
  {
    "code": 14180000,
    "name": "결박의 덫",
    "isStigma": true
  },
  {
    "code": 14150000,
    "name": "환영 화살",
    "isStigma": true
  },
  {
    "code": 14190000,
    "name": "은신",
    "isStigma": true
  },
  {
    "code": 14160000,
    "name": "봉인 화살",
    "isStigma": true
  },
  {
    "code": 14350000,
    "name": "대자연의 숨결",
    "isStigma": true
  },
  {
    "code": 14060000,
    "name": "그리폰 화살",
    "isStigma": true
  },
  {
    "code": 14360000,
    "name": "폭발 화살",
    "isStigma": true
  },
  {
    "code": 14700000,
    "name": "강습 강타",
    "isStigma": true
  },
  {
    "code": 14380000,
    "name": "지원 사격",
    "isStigma": true
  },
  {
    "code": 15210000,
    "name": "불꽃 화살",
    "isStigma": false
  },
  {
    "code": 15090000,
    "name": "얼음 사슬",
    "isStigma": false
  },
  {
    "code": 15040000,
    "name": "불꽃 작살",
    "isStigma": false
  },
  {
    "code": 15280000,
    "name": "혹한의 바람",
    "isStigma": false
  },
  {
    "code": 15050000,
    "name": "불꽃 폭발",
    "isStigma": false
  },
  {
    "code": 15010000,
    "name": "화염 난사",
    "isStigma": false
  },
  {
    "code": 15150000,
    "name": "빙결",
    "isStigma": false
  },
  {
    "code": 15110000,
    "name": "겨울의 속박",
    "isStigma": false
  },
  {
    "code": 15220000,
    "name": "빙결 폭발",
    "isStigma": false
  },
  {
    "code": 15310000,
    "name": "집중의 기원",
    "isStigma": false
  },
  {
    "code": 15060000,
    "name": "지옥의 화염",
    "isStigma": false
  },
  {
    "code": 15240000,
    "name": "충격 해제",
    "isStigma": false
  },
  {
    "code": 15710000,
    "name": "불의 표식",
    "isStigma": false
  },
  {
    "code": 15720000,
    "name": "대지의 로브",
    "isStigma": false
  },
  {
    "code": 15730000,
    "name": "냉기 소환",
    "isStigma": false
  },
  {
    "code": 15740000,
    "name": "불꽃의 로브",
    "isStigma": false
  },
  {
    "code": 15760000,
    "name": "정기 흡수",
    "isStigma": false
  },
  {
    "code": 15770000,
    "name": "저항의 은혜",
    "isStigma": false
  },
  {
    "code": 15750000,
    "name": "냉기의 로브",
    "isStigma": false
  },
  {
    "code": 15780000,
    "name": "강화의 은혜",
    "isStigma": false
  },
  {
    "code": 15790000,
    "name": "회생의 계약",
    "isStigma": false
  },
  {
    "code": 15800000,
    "name": "생기 증발",
    "isStigma": false
  },
  {
    "code": 15360000,
    "name": "신성 폭발",
    "isStigma": true
  },
  {
    "code": 15160000,
    "name": "강철 보호막",
    "isStigma": true
  },
  {
    "code": 15400000,
    "name": "원소 강화",
    "isStigma": true
  },
  {
    "code": 15140000,
    "name": "저주: 나무",
    "isStigma": true
  },
  {
    "code": 15230000,
    "name": "빙설의 갑주",
    "isStigma": true
  },
  {
    "code": 15130000,
    "name": "영혼 동결",
    "isStigma": true
  },
  {
    "code": 15200000,
    "name": "냉기 폭풍",
    "isStigma": true
  },
  {
    "code": 15390000,
    "name": "불의 장벽",
    "isStigma": true
  },
  {
    "code": 15300000,
    "name": "루미엘의 공간",
    "isStigma": true
  },
  {
    "code": 15320000,
    "name": "지연 폭발",
    "isStigma": true
  },
  {
    "code": 15120000,
    "name": "빙하 강타",
    "isStigma": true
  },
  {
    "code": 15700000,
    "name": "강습 폭격",
    "isStigma": true
  },
  {
    "code": 15410000,
    "name": "동면",
    "isStigma": true
  },
  {
    "code": 13010000,
    "name": "빠른 베기",
    "isStigma": false
  },
  {
    "code": 13100000,
    "name": "맹수의 포효",
    "isStigma": false
  },
  {
    "code": 13070000,
    "name": "암습",
    "isStigma": false
  },
  {
    "code": 13060000,
    "name": "기습",
    "isStigma": false
  },
  {
    "code": 13350000,
    "name": "심장 찌르기",
    "isStigma": false
  },
  {
    "code": 13340000,
    "name": "폭풍 난무",
    "isStigma": false
  },
  {
    "code": 13210000,
    "name": "회오리 베기",
    "isStigma": false
  },
  {
    "code": 13050000,
    "name": "섬광 베기",
    "isStigma": false
  },
  {
    "code": 13360000,
    "name": "침투",
    "isStigma": false
  },
  {
    "code": 13220000,
    "name": "그림자 낙하",
    "isStigma": false
  },
  {
    "code": 13130000,
    "name": "문양 폭발",
    "isStigma": false
  },
  {
    "code": 13260000,
    "name": "충격 해제",
    "isStigma": false
  },
  {
    "code": 13710000,
    "name": "육감 극대화",
    "isStigma": false
  },
  {
    "code": 13720000,
    "name": "빈틈 노리기",
    "isStigma": false
  },
  {
    "code": 13730000,
    "name": "독 바르기",
    "isStigma": false
  },
  {
    "code": 13740000,
    "name": "배후 강타",
    "isStigma": false
  },
  {
    "code": 13750000,
    "name": "강습 자세",
    "isStigma": false
  },
  {
    "code": 13760000,
    "name": "충격 적중",
    "isStigma": false
  },
  {
    "code": 13770000,
    "name": "기습 자세",
    "isStigma": false
  },
  {
    "code": 13780000,
    "name": "방어 균열",
    "isStigma": false
  },
  {
    "code": 13790000,
    "name": "회생의 계약",
    "isStigma": false
  },
  {
    "code": 13800000,
    "name": "각오",
    "isStigma": false
  },
  {
    "code": 13270000,
    "name": "맹수의 송곳니",
    "isStigma": true
  },
  {
    "code": 13390000,
    "name": "신속의 계약",
    "isStigma": true
  },
  {
    "code": 13250000,
    "name": "연막탄",
    "isStigma": true
  },
  {
    "code": 13080000,
    "name": "회피 자세",
    "isStigma": true
  },
  {
    "code": 13280000,
    "name": "나선 베기",
    "isStigma": true
  },
  {
    "code": 13180000,
    "name": "그림자 보행",
    "isStigma": true
  },
  {
    "code": 13020000,
    "name": "암검 투척",
    "isStigma": true
  },
  {
    "code": 13300000,
    "name": "트리니엘의 비수",
    "isStigma": true
  },
  {
    "code": 13230000,
    "name": "공중 포박",
    "isStigma": true
  },
  {
    "code": 13310000,
    "name": "환영 분신",
    "isStigma": true
  },
  {
    "code": 13370000,
    "name": "회피의 계약",
    "isStigma": true
  },
  {
    "code": 13700000,
    "name": "강습 습격",
    "isStigma": true
  },
  {
    "code": 13140000,
    "name": "암영보",
    "isStigma": true
  },
  {
    "code": 12010000,
    "name": "맹렬한 일격",
    "isStigma": false
  },
  {
    "code": 12040000,
    "name": "연속 난타",
    "isStigma": false
  },
  {
    "code": 12130000,
    "name": "포획",
    "isStigma": false
  },
  {
    "code": 12100000,
    "name": "방패 강타",
    "isStigma": false
  },
  {
    "code": 12240000,
    "name": "심판",
    "isStigma": false
  },
  {
    "code": 12340000,
    "name": "섬광 난무",
    "isStigma": false
  },
  {
    "code": 12270000,
    "name": "쇠약의 맹타",
    "isStigma": false
  },
  {
    "code": 12350000,
    "name": "비호의 일격",
    "isStigma": false
  },
  {
    "code": 12430000,
    "name": "방패 돌격",
    "isStigma": false
  },
  {
    "code": 12300000,
    "name": "섬멸",
    "isStigma": false
  },
  {
    "code": 12090000,
    "name": "징벌",
    "isStigma": false
  },
  {
    "code": 12260000,
    "name": "충격 해제",
    "isStigma": false
  },
  {
    "code": 12710000,
    "name": "체력 강화",
    "isStigma": false
  },
  {
    "code": 12720000,
    "name": "비호의 방패",
    "isStigma": false
  },
  {
    "code": 12730000,
    "name": "단죄의 가호",
    "isStigma": false
  },
  {
    "code": 12740000,
    "name": "철벽 방어",
    "isStigma": false
  },
  {
    "code": 12750000,
    "name": "수호의 인장",
    "isStigma": false
  },
  {
    "code": 12760000,
    "name": "충격 적중",
    "isStigma": false
  },
  {
    "code": 12770000,
    "name": "모욕의 포효",
    "isStigma": false
  },
  {
    "code": 12780000,
    "name": "격앙",
    "isStigma": false
  },
  {
    "code": 12790000,
    "name": "생존 의지",
    "isStigma": false
  },
  {
    "code": 12800000,
    "name": "고통 차단",
    "isStigma": false
  },
  {
    "code": 12310000,
    "name": "주신의 징벌",
    "isStigma": true
  },
  {
    "code": 12320000,
    "name": "네자칸의 방패",
    "isStigma": true
  },
  {
    "code": 12110000,
    "name": "보호의 방패",
    "isStigma": true
  },
  {
    "code": 12120000,
    "name": "도발",
    "isStigma": true
  },
  {
    "code": 12200000,
    "name": "균형의 갑옷",
    "isStigma": true
  },
  {
    "code": 12190000,
    "name": "이중 갑옷",
    "isStigma": true
  },
  {
    "code": 12070000,
    "name": "파멸의 방패",
    "isStigma": true
  },
  {
    "code": 12230000,
    "name": "고결의 갑주",
    "isStigma": true
  },
  {
    "code": 12410000,
    "name": "처형의 검",
    "isStigma": true
  },
  {
    "code": 12250000,
    "name": "전우 보호",
    "isStigma": true
  },
  {
    "code": 12220000,
    "name": "나포",
    "isStigma": true
  },
  {
    "code": 12700000,
    "name": "강습 맹격",
    "isStigma": true
  },
  {
    "code": 12450000,
    "name": "전장의 깃발",
    "isStigma": true
  },
  {
    "code": 16010000,
    "name": "냉기 충격",
    "isStigma": false
  },
  {
    "code": 16040000,
    "name": "화염 전소",
    "isStigma": false
  },
  {
    "code": 16100000,
    "name": "소환: 불의 정령",
    "isStigma": false
  },
  {
    "code": 16110000,
    "name": "소환: 물의 정령",
    "isStigma": false
  },
  {
    "code": 16140000,
    "name": "협공: 저주",
    "isStigma": false
  },
  {
    "code": 16340000,
    "name": "연속 난사",
    "isStigma": false
  },
  {
    "code": 16130000,
    "name": "소환: 땅의 정령",
    "isStigma": false
  },
  {
    "code": 16330000,
    "name": "공간 지배",
    "isStigma": false
  },
  {
    "code": 16120000,
    "name": "소환: 바람의 정령",
    "isStigma": false
  },
  {
    "code": 16070000,
    "name": "영혼의 절규",
    "isStigma": false
  },
  {
    "code": 16300000,
    "name": "원소 융합",
    "isStigma": false
  },
  {
    "code": 16200000,
    "name": "충격 해제",
    "isStigma": false
  },
  {
    "code": 16710000,
    "name": "정령 타격",
    "isStigma": false
  },
  {
    "code": 16720000,
    "name": "정령 보호",
    "isStigma": false
  },
  {
    "code": 16730000,
    "name": "정령 강림",
    "isStigma": false
  },
  {
    "code": 16740000,
    "name": "침식",
    "isStigma": false
  },
  {
    "code": 16750000,
    "name": "정령 회생",
    "isStigma": false
  },
  {
    "code": 16760000,
    "name": "정신 집중",
    "isStigma": false
  },
  {
    "code": 16800000,
    "name": "연속 역류",
    "isStigma": false
  },
  {
    "code": 16770000,
    "name": "정령 교감",
    "isStigma": false
  },
  {
    "code": 16790000,
    "name": "회생의 계약",
    "isStigma": false
  },
  {
    "code": 16780000,
    "name": "원소 결집",
    "isStigma": false
  },
  {
    "code": 16240000,
    "name": "협공: 파멸의 공세",
    "isStigma": true
  },
  {
    "code": 16190000,
    "name": "강화: 정령의 가호",
    "isStigma": true
  },
  {
    "code": 16370000,
    "name": "불길의 축복",
    "isStigma": true
  },
  {
    "code": 16250000,
    "name": "소환: 고대의 정령",
    "isStigma": true
  },
  {
    "code": 16150000,
    "name": "협공: 부식",
    "isStigma": true
  },
  {
    "code": 16360000,
    "name": "카이시넬의 권능",
    "isStigma": true
  },
  {
    "code": 16060000,
    "name": "흡인",
    "isStigma": true
  },
  {
    "code": 16080000,
    "name": "공포의 절규",
    "isStigma": true
  },
  {
    "code": 16220000,
    "name": "저주의 구름",
    "isStigma": true
  },
  {
    "code": 16230000,
    "name": "마법 강탈",
    "isStigma": true
  },
  {
    "code": 16260000,
    "name": "마법 차단",
    "isStigma": true
  },
  {
    "code": 16700000,
    "name": "강습 공포",
    "isStigma": true
  },
  {
    "code": 16170000,
    "name": "명령: 대역",
    "isStigma": true
  },
  {
    "code": 17010000,
    "name": "대지의 응보",
    "isStigma": false
  },
  {
    "code": 17020000,
    "name": "뇌전",
    "isStigma": false
  },
  {
    "code": 17030000,
    "name": "방전",
    "isStigma": false
  },
  {
    "code": 17040000,
    "name": "심판의 번개",
    "isStigma": false
  },
  {
    "code": 17050000,
    "name": "천벌",
    "isStigma": false
  },
  {
    "code": 17080000,
    "name": "약화의 낙인",
    "isStigma": false
  },
  {
    "code": 17150000,
    "name": "신성한 기운",
    "isStigma": false
  },
  {
    "code": 17070000,
    "name": "고통의 연쇄",
    "isStigma": false
  },
  {
    "code": 17370000,
    "name": "벼락 난사",
    "isStigma": false
  },
  {
    "code": 17090000,
    "name": "재생의 빛",
    "isStigma": false
  },
  {
    "code": 17350000,
    "name": "단죄",
    "isStigma": false
  },
  {
    "code": 17100000,
    "name": "치유의 빛",
    "isStigma": false
  },
  {
    "code": 17120000,
    "name": "쾌유의 광휘",
    "isStigma": false
  },
  {
    "code": 17060000,
    "name": "벽력",
    "isStigma": false
  },
  {
    "code": 17240000,
    "name": "충격 해제",
    "isStigma": false
  },
  {
    "code": 17710000,
    "name": "따뜻한 가호",
    "isStigma": false
  },
  {
    "code": 17720000,
    "name": "주신의 가호",
    "isStigma": false
  },
  {
    "code": 17730000,
    "name": "주신의 은총",
    "isStigma": false
  },
  {
    "code": 17740000,
    "name": "치유력 강화",
    "isStigma": false
  },
  {
    "code": 17750000,
    "name": "불사의 장막",
    "isStigma": false
  },
  {
    "code": 17760000,
    "name": "회복 차단",
    "isStigma": false
  },
  {
    "code": 17770000,
    "name": "집중의 기도",
    "isStigma": false
  },
  {
    "code": 17780000,
    "name": "대지의 은총",
    "isStigma": false
  },
  {
    "code": 17790000,
    "name": "생존 의지",
    "isStigma": false
  },
  {
    "code": 17800000,
    "name": "찬란한 가호",
    "isStigma": false
  },
  {
    "code": 17280000,
    "name": "권능 폭발",
    "isStigma": true
  },
  {
    "code": 17290000,
    "name": "면죄",
    "isStigma": true
  },
  {
    "code": 17160000,
    "name": "생명의 권능",
    "isStigma": true
  },
  {
    "code": 17430000,
    "name": "증폭의 기도",
    "isStigma": true
  },
  {
    "code": 17390000,
    "name": "소환 부활",
    "isStigma": true
  },
  {
    "code": 17400000,
    "name": "대지의 징벌",
    "isStigma": true
  },
  {
    "code": 17270000,
    "name": "구원",
    "isStigma": true
  },
  {
    "code": 17190000,
    "name": "속박",
    "isStigma": true
  },
  {
    "code": 17410000,
    "name": "보호의 빛",
    "isStigma": true
  },
  {
    "code": 17420000,
    "name": "유스티엘의 권능",
    "isStigma": true
  },
  {
    "code": 17300000,
    "name": "파멸의 목소리",
    "isStigma": true
  },
  {
    "code": 17700000,
    "name": "강습 낙인",
    "isStigma": true
  },
  {
    "code": 17440000,
    "name": "고결한 기운",
    "isStigma": true
  },
  {
    "code": 18010000,
    "name": "격파쇄",
    "isStigma": false
  },
  {
    "code": 18040000,
    "name": "백열격",
    "isStigma": false
  },
  {
    "code": 18090000,
    "name": "돌진 격파",
    "isStigma": false
  },
  {
    "code": 18060000,
    "name": "타격쇄",
    "isStigma": false
  },
  {
    "code": 18100000,
    "name": "암격쇄",
    "isStigma": false
  },
  {
    "code": 18300000,
    "name": "질풍 난무",
    "isStigma": false
  },
  {
    "code": 18150000,
    "name": "열파격",
    "isStigma": false
  },
  {
    "code": 18120000,
    "name": "쾌유의 주문",
    "isStigma": false
  },
  {
    "code": 18210000,
    "name": "진동쇄",
    "isStigma": false
  },
  {
    "code": 18080000,
    "name": "파동격",
    "isStigma": false
  },
  {
    "code": 18290000,
    "name": "회전격",
    "isStigma": false
  },
  {
    "code": 18200000,
    "name": "충격 해제",
    "isStigma": false
  },
  {
    "code": 18710000,
    "name": "생명의 축복",
    "isStigma": false
  },
  {
    "code": 18720000,
    "name": "십자 방어",
    "isStigma": false
  },
  {
    "code": 18730000,
    "name": "보호진",
    "isStigma": false
  },
  {
    "code": 18740000,
    "name": "고취의 주문",
    "isStigma": false
  },
  {
    "code": 18750000,
    "name": "공격 준비",
    "isStigma": false
  },
  {
    "code": 18760000,
    "name": "충격 적중",
    "isStigma": false
  },
  {
    "code": 18770000,
    "name": "격노의 주문",
    "isStigma": false
  },
  {
    "code": 18780000,
    "name": "대지의 약속",
    "isStigma": false
  },
  {
    "code": 18790000,
    "name": "생존 의지",
    "isStigma": false
  },
  {
    "code": 18800000,
    "name": "바람의 약속",
    "isStigma": false
  },
  {
    "code": 18220000,
    "name": "멸화",
    "isStigma": true
  },
  {
    "code": 18190000,
    "name": "불패의 진언",
    "isStigma": true
  },
  {
    "code": 18140000,
    "name": "집중 방어",
    "isStigma": true
  },
  {
    "code": 18160000,
    "name": "질주의 진언",
    "isStigma": true
  },
  {
    "code": 18130000,
    "name": "분쇄격",
    "isStigma": true
  },
  {
    "code": 18330000,
    "name": "마르쿠탄의 분노",
    "isStigma": true
  },
  {
    "code": 18240000,
    "name": "차단의 권능",
    "isStigma": true
  },
  {
    "code": 18230000,
    "name": "결박의 낙인",
    "isStigma": true
  },
  {
    "code": 18170000,
    "name": "쾌유의 손길",
    "isStigma": true
  },
  {
    "code": 18250000,
    "name": "질풍의 권능",
    "isStigma": true
  },
  {
    "code": 18420000,
    "name": "수호의 축복",
    "isStigma": true
  },
  {
    "code": 18700000,
    "name": "강습 충격",
    "isStigma": true
  },
  {
    "code": 18440000,
    "name": "결계의 주문",
    "isStigma": true
  }
];

export const SKILL_MAP = new Map<number, SkillInfo>(SKILL_DATA.map((s) => [s.code, s]));

export const ALL_SKILL_CODES = SKILL_DATA.map((s) => s.code);
export const SKILL_ORDER_MAP = new Map<number, number>(
  ALL_SKILL_CODES.map((code, idx) => [code, idx]),
);
export const DEFAULT_VISIBLE_SKILL_CODES = ALL_SKILL_CODES;

export const GROUPED_BY_JOB = Object.entries(JOB_PREFIX_MAP).map(([job, prefix]) => {
  const jobSkills = SKILL_DATA.filter((s) => Math.floor(s.code / 1_000_000) === prefix);
  return {
    job,
    normalSkills: jobSkills.filter((s) => !s.isStigma).map((s) => s.code),
    stigmaSkills: jobSkills.filter((s) => s.isStigma).map((s) => s.code),
  };
});

export const getSkillName = (code: number | string): string | undefined =>
  SKILL_MAP.get(Number(code))?.name;
