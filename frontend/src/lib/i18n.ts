export type Language = 'ko' | 'ja' | 'en';

export const getLang = (): Language => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('jhc_lang') as Language) || 'ko';
  }
  return 'ko';
};

export const setLang = (lang: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jhc_lang', lang);
    window.location.reload();
  }
};

export const DICT = {
  ko: {
    nav: {
      home: '홈',
      guide: '이용안내',
      mypage: '마이페이지',
      logout: '로그아웃',
      login: '로그인',
      register: '회원가입',
      props: '매물검색',
      map: '지도검색',
      saved: '찜한매물',
      share: '셰어하우스',
      moving: '이사·청소',
      calc: '비용계산',
      chat: 'AI채팅',
      contract: '전자계약',
      community: '커뮤니티',
      life: '생활가이드',
      start: '시작하기',
      welcome: '환영합니다!',
      sir: '님'
    },
    footer: {
      desc: '외국인이 일본에서 집을 구할 때 필요한 모든 것.\n언어 장벽 없이 내 집 찾기부터 계약, 이사까지.',
      service: '서비스',
      tools: '생활 도구',
      support: '고객 지원',
      terms: '이용약관',
      privacy: '개인정보처리방침',
      faq: '도움말 (FAQ)',
      contact: '제휴 및 문의'
    },
    common: {
      rent: '월세',
      deposit: '보증금',
      adminFee: '관리비',
      search: '검색',
      reset_filter: '필터 초기화',
      no_results: '조건에 맞는 결과가 없습니다',
      loading: '불러오는 중...',
      month: '월',
      rooms: '빈 방'
    },
    props: {
      title: '매물 검색',
      desc: '외국인 환영 매물부터 반려동물 OK까지, 조건에 맞는 일본 주택을 찾아보세요',
      placeholder: '지역명·역이름·키워드 검색 (한국어 OK: 신주쿠, 시부야...)',
      filter_open: '▼ 상세 필터 열기',
      filter_close: '▲ 필터 접기',
      total: '총',
      cases: '건',
      rent_range: '월세 범위',
      room_type: '방 타입',
      all: '전체',
      foreigner: '외국인 환영만',
      pet: '반려동물 OK만',
      amenity: '설비·어메니티',
      sort: '정렬:',
      sort_rent_asc: '월세 낮은순',
      sort_rent_desc: '월세 높은순',
      sort_rating: '평점 높은순',
      tag_foreigner: '외국인 OK',
      tag_pet: '반려동물 OK'
    },
    home: {
      title: '쉽고 빠른 일본 주택 찾기',
      desc_html: '외국인이라는 이유로 막막하셨나요? 일본어부터 복잡한 서류 절차, <br className="hidden md:block"/> AI 번역과 안전한 전자계약으로 한 번에 끝내보세요.',
      placeholder: '살고 싶은 지역 (도쿄, 오사카 등) 또는 지하철역 이름 검색',
      featured_title: '최신 추천 하우스',
      featured_desc: 'AI가 추천하는 인기 다국어 대응 안심 매물',
      view_all: '전체보기',
      why_title: 'Japan Housing Connect 특장점',
      why_1_title: '언어 장벽 제로',
      why_1_desc: '집주인과 메신저 내용이 실시간 자동 번역됩니다. 현지어를 몰라도 계약에 문제 없습니다.',
      why_2_title: '전자 서명 계약',
      why_2_desc: '복잡한 종이 문서 없이 100% 디지털로 안전하고 투명하게 전자 계약 서명이 진행됩니다.',
      why_3_title: '투명한 초기비용',
      why_3_desc: '보증금(敷金), 사례금(礼金) 등 숨겨진 비용 없이 처음부터 모든 초기비용을 시뮬레이션 합니다.',
      why_4_title: '100% 검증 매물',
      why_4_desc: '외국인을 꺼려하는 불필요한 매물은 제외하고 실제 입주 가능한 안심 매물만 필터링합니다.',
      banner_title: '무료로 회원가입하고 더 많은 혜택을 누리세요!',
      banner_desc: '관심 매물 찜하기, 커뮤니티 글쓰기 기능이 오픈됩니다.'
    },
    mypage: {
      title: '마이페이지',
      desc: '내 정보 수정 및 관심 매물을 관리하세요',
      tab_profile: '정보 수정',
      tab_saved: '관심 페이지',
      profile_settings: '계정 정보 설정',
      email_label: '이메일 주소 (아이디)',
      email_desc: '이메일 주소는 변경할 수 없습니다.',
      name_label: '이름 (닉네임)',
      btn_edit: '수정',
      pwd_label: '비밀번호',
      btn_pwd: '비밀번호 변경하기',
      btn_cancel: '취소',
      btn_save: '저장하기',
      saved_title: '저장한 관심 매물',
      saved_empty: '아직 찜한 관심 매물이 없습니다',
      btn_browse_props: '매물 둘러보기',
      btn_browse_share: '셰어하우스 보기',
      type_prop: '일반 매물',
      type_share: '셰어하우스',
      alert_login: '로그인이 필요합니다.',
      alert_saved: '프로필 정보가 수정되었습니다.'
    },
    share: {
      title: '셰어하우스',
      desc: '외국인과 일본인이 함께 사는 셰어하우스를 찾아보세요',
      placeholder: '셰어하우스 이름, 지역으로 검색...',
      max_rent: '월세 상한 없음',
      sort_basic: '기본순',
      sort_rooms: '빈 방 많은순',
      rooms_count: '실',
      full: '만실',
      about_title: '💡 셰어하우스란?',
      about_desc: '셰어하우스는 개인 방은 따로 있고, 주방·거실·욕실 등을 공유하는 주거 형태입니다. 일반 원룸보다 저렴하면서도 다국적 입주자와의 교류가 가능해 일본에 처음 오는 외국인에게 인기입니다. 보증인이 필요 없고, 가구 포함인 곳이 많아 초기 비용도 절약할 수 있습니다.'
    }
  },
  ja: {
    nav: {
      home: 'ホーム',
      guide: 'ご利用案内',
      mypage: 'マイページ',
      logout: 'ログアウト',
      login: 'ログイン',
      register: '会員登録',
      props: '物件検索',
      map: 'マップ検索',
      saved: 'お気に入り',
      share: 'シェアハウス',
      moving: '引越し・清掃',
      calc: '費用計算',
      chat: 'AIチャット',
      contract: '電子契約',
      community: 'コミュニティ',
      life: '生活ガイド',
      start: 'はじめる',
      welcome: 'ようこそ！',
      sir: '様'
    },
    footer: {
      desc: '外国人が日本で家を探すために必要なすべて。\n言葉の壁なしで家探しから契約、引っ越しまで。',
      service: 'サービス',
      tools: '生活ツール',
      support: 'サポート',
      terms: '利用規約',
      privacy: 'プライバシーポリシー',
      faq: 'ヘルプ (FAQ)',
      contact: 'お問い合わせ'
    },
    common: {
      rent: '家賃',
      deposit: '敷金',
      adminFee: '管理費',
      search: '検索',
      reset_filter: '条件をクリア',
      no_results: '条件に合う物件がありません',
      loading: '読み込み中...',
      month: '月',
      rooms: '空室'
    },
    props: {
      title: '物件検索',
      desc: '外国人歓迎からペット可まで、条件に合う日本の住宅を探しましょう',
      placeholder: 'エリア・駅名・キーワード検索 (新宿、渋谷など)',
      filter_open: '▼ 詳細フィルターを開く',
      filter_close: '▲ フィルターを閉じる',
      total: '計',
      cases: '件',
      rent_range: '家賃（円）',
      room_type: '間取り',
      all: 'すべて',
      foreigner: '外国人歓迎のみ',
      pet: 'ペット可のみ',
      amenity: '設備・条件',
      sort: '並び替え:',
      sort_rent_asc: '家賃が安い順',
      sort_rent_desc: '家賃が高い順',
      sort_rating: '評価が高い順',
      tag_foreigner: '外国人OK',
      tag_pet: 'ペットOK'
    },
    home: {
      title: '簡単・スピーディな日本の家探し',
      desc_html: '外国人という理由で不安でしたか？日本語から複雑な書類手続き、<br className="hidden md:block"/> AI翻訳と安全な電子契約で一気に解決しましょう。',
      placeholder: '住みたいエリア（東京、大阪など）または駅名で検索',
      featured_title: '最新のおすすめ物件',
      featured_desc: 'AIがおすすめする多言語対応の安心物件',
      view_all: 'すべて見る',
      why_title: 'Japan Housing Connect の特徴',
      why_1_title: '言葉の壁ゼロ',
      why_1_desc: '大家さんとのメッセージがリアルタイムで自動翻訳されます。現地語が分からなくても契約可能です。',
      why_2_title: '電子署名契約',
      why_2_desc: '複雑な紙の文書なしに、100%デジタルで安全かつ透明に電子契約が進みます。',
      why_3_title: '透明な初期費用',
      why_3_desc: '敷金、礼金などの隠れた費用なしに、最初からすべての初期費用をシミュレーションします。',
      why_4_title: '100% 検証済み物件',
      why_4_desc: '外国人を敬遠する不要な物件は除外し、実際に入居可能な安心物件のみをフィルタリングします。',
      banner_title: '無料会員登録でもっと多くの特典を！',
      banner_desc: 'お気に入り機能、コミュニティ書き込み機能が利用可能になります。'
    },
    mypage: {
      title: 'マイページ',
      desc: 'プロフィールやお気に入りの物件を管理します',
      tab_profile: 'プロフィール設定',
      tab_saved: 'お気に入りページ',
      profile_settings: 'アカウント情報設定',
      email_label: 'メールアドレス (ID)',
      email_desc: 'メールアドレスは変更できません。',
      name_label: '名前 (ニックネーム)',
      btn_edit: '編集',
      pwd_label: 'パスワード',
      btn_pwd: 'パスワードを変更',
      btn_cancel: 'キャンセル',
      btn_save: '保存する',
      saved_title: '保存したお気に入り物件',
      saved_empty: 'まだお気に入りの物件がありません',
      btn_browse_props: '物件を見る',
      btn_browse_share: 'シェアハウスを見る',
      type_prop: '一般物件',
      type_share: 'シェアハウス',
      alert_login: 'ログインが必要です。',
      alert_saved: 'プロフィール情報が修正されました。'
    },
    share: {
      title: 'シェアハウス',
      desc: '外国人と日本人が一緒に暮らすシェアハウスを探しましょう',
      placeholder: 'シェアハウス名、エリアで検索...',
      max_rent: '家賃上限なし',
      sort_basic: 'おすすめ順',
      sort_rooms: '空室が多い順',
      rooms_count: '室',
      full: '満室',
      about_title: '💡 シェアハウスとは？',
      about_desc: 'シェアハウスは個室があり、キッチン・リビング・バスルームを共有する住居形態です。通常のワンルームより安く、多国籍な入居者と交流できるため外国人に人気です。保証人不要、家具付きが多く初期費用も節約できます。'
    }
  },
  en: {
    nav: {
      home: 'Home',
      guide: 'Guide',
      mypage: 'My Page',
      logout: 'Logout',
      login: 'Login',
      register: 'Sign Up',
      props: 'Properties',
      map: 'Map Search',
      saved: 'Saved',
      share: 'Sharehouses',
      moving: 'Moving/Cleaning',
      calc: 'Calculator',
      chat: 'AI Chat',
      contract: 'E-Contract',
      community: 'Community',
      life: 'Life Guide',
      start: 'Get Started',
      welcome: 'Welcome!',
      sir: ''
    },
    footer: {
      desc: 'Everything a foreigner needs to find a home in Japan.\nFrom searching to contracts to moving, without language barriers.',
      service: 'Services',
      tools: 'Tools',
      support: 'Support',
      terms: 'Terms of Use',
      privacy: 'Privacy Policy',
      faq: 'Help (FAQ)',
      contact: 'Contact Us'
    },
    common: {
      rent: 'Rent',
      deposit: 'Deposit',
      adminFee: 'Admin Fee',
      search: 'Search',
      reset_filter: 'Reset Filters',
      no_results: 'No results found',
      loading: 'Loading...',
      month: 'mo',
      rooms: 'Vacant'
    },
    props: {
      title: 'Property Search',
      desc: 'Find Japanese homes matching your needs, from foreigner-friendly to pet-allowed',
      placeholder: 'Area, Station, Keywords (Shinjuku, Shibuya...)',
      filter_open: '▼ Open Filters',
      filter_close: '▲ Close Filters',
      total: 'Total',
      cases: 'results',
      rent_range: 'Rent Range',
      room_type: 'Layout',
      all: 'All',
      foreigner: 'Foreigner Friendly',
      pet: 'Pet Friendly',
      amenity: 'Amenities',
      sort: 'Sort by:',
      sort_rent_asc: 'Rent: Low to High',
      sort_rent_desc: 'Rent: High to Low',
      sort_rating: 'Rating: High to Low',
      tag_foreigner: 'Foreigner OK',
      tag_pet: 'Pet OK'
    },
    home: {
      title: 'Fast & Easy Japan Housing',
      desc_html: 'Feeling lost because you are a foreigner? From Japanese to complex paperwork, <br className="hidden md:block"/> solve it all at once with AI translation and safe e-contracts.',
      placeholder: 'Search by area (Tokyo, Osaka, etc.) or station name',
      featured_title: 'Latest Recommended Homes',
      featured_desc: 'Popular multi-language friendly homes recommended by AI',
      view_all: 'View All',
      why_title: 'Japan Housing Connect Features',
      why_1_title: 'Zero Language Barrier',
      why_1_desc: 'Messages with landlords are auto-translated in real-time. No Japanese required for contracting.',
      why_2_title: 'Digital E-Contracts',
      why_2_desc: 'Safe & transparent 100% digital electronic signing without complex paper documents.',
      why_3_title: 'Transparent Initial Costs',
      why_3_desc: 'We simulate all move-in costs from the start, without hidden fees like key-money or deposit surprises.',
      why_4_title: '100% Verified Listings',
      why_4_desc: 'We filter out listings that reject foreigners, providing only genuinely available foreigner-friendly homes.',
      banner_title: 'Sign up for free and get more benefits!',
      banner_desc: 'Unlock the wishlist feature and community posting.'
    },
    mypage: {
      title: 'My Page',
      desc: 'Manage your profile and saved properties',
      tab_profile: 'Edit Profile',
      tab_saved: 'Saved Items',
      profile_settings: 'Account Settings',
      email_label: 'Email (ID)',
      email_desc: 'Email address cannot be changed.',
      name_label: 'Name (Nickname)',
      btn_edit: 'Edit',
      pwd_label: 'Password',
      btn_pwd: 'Change Password',
      btn_cancel: 'Cancel',
      btn_save: 'Save',
      saved_title: 'Saved Properties',
      saved_empty: 'You have not saved any properties yet',
      btn_browse_props: 'Browse Properties',
      btn_browse_share: 'Browse Sharehouses',
      type_prop: 'Rental',
      type_share: 'Sharehouse',
      alert_login: 'Login is required.',
      alert_saved: 'Profile has been updated.'
    },
    share: {
      title: 'Sharehouses',
      desc: 'Find sharehouses where foreigners and locals live together',
      placeholder: 'Search by sharehouse name, area...',
      max_rent: 'No Rent Limit',
      sort_basic: 'Recommended',
      sort_rooms: 'Most Vacant Rooms',
      rooms_count: 'rms',
      full: 'Full',
      about_title: '💡 What is a Sharehouse?',
      about_desc: 'Sharehouses offer private bedrooms while sharing kitchen, living, and bath areas. They are cheaper than typical apartments and allow interaction with multinational residents, making them popular among foreigners. Many require no guarantor and come furnished, saving initial costs.'
    }
  }
};

const JA_MAP: Record<string, string> = {
  '도쿄도': '東京都', '신주쿠구': '新宿区', '토시마구': '豊島区', '시부야구': '渋谷区',
  '무사시노시': '武蔵野市', '세타가야구': '世田谷区', '미나토구': '港区', '메구로구': '目黒区',
  '나카노구': '中野区', '치요다구': '千代田区', '다이토구': '台東区', '네리마구': '練馬区', '이타바시구': '板橋区', '스기나미구': '杉並区',
  '나카이': '中井', '키타자와': '北沢', '이케부쿠로': '池袋', '히가시': '東', '센다가야': '千駄ヶ谷',
  '혼마치': '本町', '아자부주반': '麻布十番', '시로카네': '白金', '카이간': '海岸', '타카반': '鷹番',
  '카미메구로': '上目黒', '추오': '中央', '와카미야': '若宮', '미나미카라스야마': '南烏山', '다이시도': '太子堂',
  '소토칸다': '外神田', '아사쿠사': '浅草', '키치조지혼초': '吉祥寺本町', '토요타마키타': '豊玉北', '이타바시': '板橋',
  '와카마츠초': '若松町', '요코테라마치': '横寺町', '오기쿠보': '荻窪', '니시신주쿠': '西新宿', '진난': '神南', '나카노': '中野', '코엔지미나미': '高円寺南',
  '1초메': '1丁目', '2초메': '2丁目', '3초메': '3丁目', '4초메': '4丁目', '5초메': '5丁目', '6초메': '6丁目',
  '아파트': 'アパート', '가족형': 'ファミリー向け', '도보': '徒歩', '분': '分',
  '역': '駅 ', '선/': '線 / ', 'JR': 'JR', '도쿄메트로': '東京メトロ', '도에이': '都営', '세이부': '西武', '도큐': '東急',
  '주오선': '中央線', '신주쿠선': '新宿線', '유라쿠초선': '有楽町線', '난보쿠선': '南北線', '미타선': '三田線',
  '야마노테선': '山手線', '사이쿄선': '埼京線', '토요코선': '東横線', '덴엔토시선': '田園都市線', '오에도선': '大江戸線',
  '아사쿠사선': '浅草線', '게이오선': '京王線', '오다큐선': '小田急線',
  '오기쿠보역': '荻窪駅', '나카이역': '中井駅', '시모키타자와역': '下北沢駅', '이케부쿠로역': '池袋駅',
  '에비스역': '恵比寿駅', '요요기역': '代々木駅', '오츠카역': '大塚駅', '카나메초역': '要町駅',
  '아자부주반역': '麻布十番駅', '시로카네다이역': '白金台駅', '하마마츠초역': '浜松町駅', '가쿠게이다이가쿠역': '学芸大学駅',
  '나카메구로역': '中目黒駅', '신나카노역': '新中野駅', '토리츠카세이역': '都立家政駅', '로카코엔역': '芦花公園駅',
  '산겐자야역': '三軒茶屋駅', '아키하바라역': '秋葉原駅', '키치조지역': '吉祥寺駅', '네리마역': '練馬駅', '이타바시역': '板橋駅',
  '와카마츠카와다역': '若松河田駅', '우시고메카구라자카역': '牛込神楽坂駅', '니시신주쿠고초메역': '西新宿五丁目駅',
  '브라이즈': 'ブライズ', '프라우드': 'プラウド', '디아쥬': 'ディアージュ', '프라임어반': 'プライムアーバン',
  '라산테': 'ラサンテ', '더 파크하비오': 'ザ・パークハビオ', '파크하비오': 'パークハビオ', '레지던스': 'レジデンス',
  '더 파크하우스': 'ザ・パークハウス', '파크코트': 'パークコート', '콘포리아 리브': 'コンフォリア・リヴ',
  '셀레스티아': 'セレスティア', '로렐타워 르네': 'ローレルタワー ルネ', '웰스퀘어': 'ウェルスクエア', '시티코프': 'シティコープ',
  '카사 알바': 'カーサ アルバ', '소아비타': 'ソアビータ', 'ZOOM': 'ZOOM', '신주쿠': '新宿', '나츠메자카': '夏目坂',
  '카구라자카': '神楽坂', '신주쿠교엔니시': '新宿御苑西', '릿쿄도오리': '立教通り', '시로카네니초메 타워': '白金二丁目タワー',
  '히라누마': '平沼', 'M&M 하임': 'M&Mハイム', '사쿠라하우스': 'サクラハウス', '보더리스하우스': 'ボーダレスハウス', '소셜아파트먼트': 'ソーシャルアパートメント', '셰어스타일': 'シェアスタイル', '오크하우스': 'オークハウス', '코엔지': '高円寺', '시부야': '渋谷', '맨션': 'マンション'
};

const EN_MAP: Record<string, string> = {
  '도쿄도': 'Tokyo, ', '신주쿠구': 'Shinjuku-ku, ', '토시마구': 'Toshima-ku, ', '시부야구': 'Shibuya-ku, ',
  '무사시노시': 'Musashino-shi, ', '세타가야구': 'Setagaya-ku, ', '미나토구': 'Minato-ku, ', '메구로구': 'Meguro-ku, ',
  '나카노구': 'Nakano-ku, ', '치요다구': 'Chiyoda-ku, ', '다이토구': 'Taito-ku, ', '네리마구': 'Nerima-ku, ', '이타바시구': 'Itabashi-ku, ', '스기나미구': 'Suginami-ku, ',
  '나카이': 'Nakai', '키타자와': 'Kitazawa', '이케부쿠로': 'Ikebukuro', '히가시': 'Higashi', '센다가야': 'Sendagaya',
  '혼마치': 'Honmachi', '아자부주반': 'Azabujuban', '시로카네': 'Shirokane', '카이간': 'Kaigan', '타카반': 'Takaban',
  '카미메구로': 'Kamimeguro', '추오': 'Chuo', '와카미야': 'Wakamiya', '미나미카라스야마': 'Minamikarasuyama', '다이시도': 'Taishido',
  '소토칸다': 'Sotokanda', '아사쿠사': 'Asakusa', '키치조지혼초': 'Kichijojihoncho', '토요타마키타': 'Toyotamakita', '이타바시': 'Itabashi',
  '와카마츠초': 'Wakamatsucho', '요코테라마치': 'Yokoteramachi', '오기쿠보': 'Ogikubo', '니시신주쿠': 'Nishi-Shinjuku', '진난': 'Jinnan', '나카노': 'Nakano', '코엔지미나미': 'Koenjiminami',
  '1초메': '1-chome', '2초메': '2-chome', '3초메': '3-chome', '4초메': '4-chome', '5초메': '5-chome', '6초메': '6-chome',
  '아파트': 'Apt', '가족형': 'Family', '도보': 'Walk', '분': 'min',
  '역 ': ' Sta.', '역': ' Sta.', '선/': ' Line/ ', 'JR ': 'JR ', '도쿄메트로 ': 'Tokyo Metro ', '도에이 ': 'Toei ', '세이부 ': 'Seibu ', '도큐 ': 'Tokyu ',
  '주오선': 'Chuo Line', '신주쿠선': 'Shinjuku Line', '유라쿠초선': 'Yurakucho Line', '난보쿠선': 'Namboku Line', '미타선': 'Mita Line',
  '야마노테선': 'Yamanote Line', '사이쿄선': 'Saikyo Line', '토요코선': 'Toyoko Line', '덴엔토시선': 'Den-en-toshi Line', '오에도선': 'Oedo Line',
  '아사쿠사선': 'Asakusa Line', '게이오선': 'Keio Line', '오다큐선': 'Odakyu Line',
  '오기쿠보역': 'Ogikubo Sta.', '나카이역': 'Nakai Sta.', '시모키타자와역': 'Shimokitazawa Sta.', '이케부쿠로역': 'Ikebukuro Sta.',
  '에비스역': 'Ebisu Sta.', '요요기역': 'Yoyogi Sta.', '오츠카역': 'Otsuka Sta.', '카나메초역': 'Kanamecho Sta.',
  '아자부주반역': 'Azabujuban Sta.', '시로카네다이역': 'Shirokanedai Sta.', '하마마츠초역': 'Hamamatsucho Sta.', '가쿠게이다이가쿠역': 'Gakugeidaigaku Sta.',
  '나카메구로역': 'Nakameguro Sta.', '신나카노역': 'Shin-Nakano Sta.', '토리츠카세이역': 'Toritsukasei Sta.', '로카코엔역': 'Rokakoen Sta.',
  '산겐자야역': 'Sangenjaya Sta.', '아키하바라역': 'Akihabara Sta.', '키치조지역': 'Kichijoji Sta.', '네리마역': 'Nerima Sta.', '이타바시역': 'Itabashi Sta.',
  '와카마츠카와다역': 'Wakamatsu-kawada Sta.', '우시고메카구라자카역': 'Ushigome-kagurazaka Sta.', '니시신주쿠고초메역': 'Nishi-shinjuku-gochome Sta.',
  '브라이즈': 'Brise', '프라우드': 'Proud', '디아쥬': 'Diage', '프라임어반': 'Prime Urban',
  '라산테': 'Lasante', '더 파크하비오': 'The Park Habio', '파크하비오': 'Park Habio', '레지던스': 'Residence',
  '더 파크하우스': 'The Park House', '파크코트': 'Park Court', '콘포리아 리브': 'Comforia Liv',
  '셀레스티아': 'Celestia', '로렐타워 르네': 'Laurel Tower Rene', '웰스퀘어': 'Well Square', '시티코프': 'City Corp',
  '카사 알바': 'Casa Alba', '소아비타': 'Soabita', 'ZOOM': 'ZOOM', '신주쿠': 'Shinjuku', '나츠메자카': 'Natsumezaka',
  '카구라자카': 'Kagurazaka', '신주쿠교엔니시': 'Shinjukugyoen-nishi', '릿쿄도오리': 'Rikkyo-dori', '시로카네니초메 타워': 'Shirokane 2-Chome Tower',
  '히라누마': 'Hiranuma', 'M&M 하임': 'M&M Heim', '사쿠라하우스': 'Sakura House', '보더리스하우스': 'Borderless House', '소셜아파트먼트': 'Social Apartment', '셰어스타일': 'Share Style', '오크하우스': 'Oakhouse', '코엔지': 'Koenji', '시부야': 'Shibuya', '맨션': 'Mansion'
};

export const translateDynamic = (text: string | undefined | null, lang: Language): string => {
  if (!text) return '';
  if (lang === 'ko') return text;
  
  let result = text;
  const map = lang === 'ja' ? JA_MAP : EN_MAP;
  
  // Sort keys by length descending to replace longer matches first
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    result = result.split(k).join(map[k]);
  }
  
  return result;
};
