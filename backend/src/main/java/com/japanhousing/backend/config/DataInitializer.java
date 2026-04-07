package com.japanhousing.backend.config;

import com.japanhousing.backend.model.*;
import com.japanhousing.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ReviewRepository reviewRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (propertyRepository.count() > 0) {
            return; // 이미 매물 데이터가 있으면 스킵
        }

        // ─── 집주인 계정 생성 ───
        User landlord1 = userRepository.save(User.builder()
                .email("tanaka@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("田中 太郎")
                .role(UserRole.LANDLORD)
                .nationality("Japan")
                .preferredLanguages("[\"ja\",\"en\"]")
                .bio("東京都内で複数の物件を管理しています。外国人の方も大歓迎です。")
                .build());

        User landlord2 = userRepository.save(User.builder()
                .email("suzuki@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("鈴木 花子")
                .role(UserRole.LANDLORD)
                .nationality("Japan")
                .preferredLanguages("[\"ja\",\"ko\",\"en\"]")
                .bio("大阪・神戸エリアの物件を管理しています。")
                .build());

        // ─── 세입자(SEEKER) 계정 생성 ───
        User seeker1 = userRepository.save(User.builder()
                .email("kim@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("김민준")
                .role(UserRole.SEEKER)
                .nationality("Korea")
                .preferredLanguages("[\"ko\",\"en\"]")
                .bio("도쿄에서 새로운 생활을 시작하려는 한국인입니다.")
                .build());

        User seeker2 = userRepository.save(User.builder()
                .email("chen@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("陳 偉")
                .role(UserRole.SEEKER)
                .nationality("China")
                .preferredLanguages("[\"zh\",\"en\",\"ja\"]")
                .bio("Working in Tokyo as a software engineer.")
                .build());

        // ─── 매물(Property) 생성 ───
        Property p1 = propertyRepository.save(Property.builder()
                .landlord(landlord1)
                .title("新宿駅1分 築浅1Kアパート")
                .description("新宿駅から徒歩1分の好立地。2020年築で設備が充実。外国人・ペット可。オートロック完備。")
                .address("東京都新宿区西新宿1-1-1")
                .addressDetail("新宿ハイツ202号")
                .latitude(35.6896)
                .longitude(139.6917)
                .monthlyRent(95000)
                .deposit(2)
                .advance(1)
                .squareMeters(28)
                .floor(2)
                .totalFloors(8)
                .petFriendly(true)
                .foreignerWelcome(true)
                .viewCount(234)
                .bookmarkCount(45L)
                .averageRating(4.7)
                .reviewCount(12)
                .imagesJson("[\"https://images.unsplash.com/photo-1505691723518-36a5ac3be353\"]")
                .amenitiesJson("[\"エアコン\",\"洗濯機\",\"冷蔵庫\",\"インターネット\",\"オートロック\"]")
                .build());

        Property p2 = propertyRepository.save(Property.builder()
                .landlord(landlord1)
                .title("渋谷区 静かな2DK マンション")
                .description("渋谷から電車5分。静かな住宅地にある2DKマンション。カップル・ファミリー向け。")
                .address("東京都渋谷区代河公園 2-3-4")
                .latitude(35.6580)
                .longitude(139.7016)
                .monthlyRent(135000)
                .deposit(2)
                .advance(1)
                .squareMeters(48)
                .floor(4)
                .totalFloors(10)
                .petFriendly(false)
                .foreignerWelcome(true)
                .viewCount(178)
                .bookmarkCount(22L)
                .averageRating(4.5)
                .reviewCount(8)
                .imagesJson("[\"https://images.unsplash.com/photo-1464890100898-a385f744067f\"]")
                .amenitiesJson("[\"エアコン\",\"食器洗浄機\",\"バルコニー\",\"駐車場\"]")
                .build());

        Property p3 = propertyRepository.save(Property.builder()
                .landlord(landlord2)
                .title("池袋 外国人歓迎 ペット可 1DK")
                .description("池袋駅3分。外国人・ペット可。多国籍の住人が多く、コミュニティが活発です。")
                .address("東京都豊島区東池袋1-5-2")
                .latitude(35.7295)
                .longitude(139.7109)
                .monthlyRent(82000)
                .deposit(1)
                .advance(1)
                .squareMeters(32)
                .floor(3)
                .totalFloors(6)
                .petFriendly(true)
                .foreignerWelcome(true)
                .viewCount(312)
                .bookmarkCount(67L)
                .averageRating(4.8)
                .reviewCount(18)
                .imagesJson("[\"https://images.unsplash.com/photo-1493809842364-78817add7ffb\"]")
                .amenitiesJson("[\"エアコン\",\"洗濯機\",\"ペット可\",\"インターネット\",\"バイク置場\"]")
                .build());

        Property p4 = propertyRepository.save(Property.builder()
                .landlord(landlord2)
                .title("品川区 高層タワー 1LDK 眺望良好")
                .description("品川駅直結タワーマンション。コンシェルジュサービス付き。ビジネスマン向け。")
                .address("東京都品川区港南2-16-1")
                .latitude(35.6268)
                .longitude(139.7401)
                .monthlyRent(185000)
                .deposit(3)
                .advance(1)
                .squareMeters(55)
                .floor(22)
                .totalFloors(43)
                .petFriendly(false)
                .foreignerWelcome(true)
                .viewCount(89)
                .bookmarkCount(31L)
                .averageRating(4.9)
                .reviewCount(5)
                .imagesJson("[\"https://images.unsplash.com/photo-1486325212027-8081e485255e\"]")
                .amenitiesJson("[\"コンシェルジュ\",\"ジム\",\"ラウンジ\",\"宅配ボックス\",\"駐車場\"]")
                .build());

        Property p5 = propertyRepository.save(Property.builder()
                .landlord(landlord1)
                .title("中野区 リノベ済み 1K 格安物件")
                .description("中野駅7分。フルリノベーション済みで清潔感あり。初めての一人暮らしに最適。格安！")
                .address("東京都中野区中野3-7-2")
                .latitude(35.7073)
                .longitude(139.6639)
                .monthlyRent(68000)
                .deposit(1)
                .advance(1)
                .squareMeters(22)
                .floor(1)
                .totalFloors(4)
                .petFriendly(false)
                .foreignerWelcome(true)
                .viewCount(445)
                .bookmarkCount(89L)
                .averageRating(4.3)
                .reviewCount(22)
                .imagesJson("[\"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688\"]")
                .amenitiesJson("[\"エアコン\",\"洗濯機\",\"インターネット\"]")
                .build());

        Property p6 = propertyRepository.save(Property.builder()
                .landlord(landlord2)
                .title("吉祥寺 ペット可 広めの2K")
                .description("吉祥寺駅5分。井の頭公園近く。緑豊かな環境でペットと快適な生活を。")
                .address("東京都武蔵野市吉祥寺南町1-9-3")
                .latitude(35.7022)
                .longitude(139.5716)
                .monthlyRent(115000)
                .deposit(2)
                .advance(1)
                .squareMeters(42)
                .floor(2)
                .totalFloors(5)
                .petFriendly(true)
                .foreignerWelcome(true)
                .viewCount(267)
                .bookmarkCount(53L)
                .averageRating(4.6)
                .reviewCount(14)
                .imagesJson("[\"https://images.unsplash.com/photo-1578683010236-d716f9a3f461\"]")
                .amenitiesJson("[\"エアコン\",\"浴槽\",\"ペット可\",\"公園近く\",\"駐車場\"]")
                .build());

        // ─── 리뷰(Review) 생성 ───
        reviewRepository.save(Review.builder()
                .author(seeker1)
                .property(p1)
                .targetUser(landlord1)
                .rating(5)
                .comment("역에서 매우 가깝고 깨끗합니다. 집주인 분도 친절하게 대응해 주셔서 좋았습니다. 외국인도 안심하고 입주할 수 있어요!")
                .build());

        reviewRepository.save(Review.builder()
                .author(seeker2)
                .property(p1)
                .targetUser(landlord1)
                .rating(4)
                .comment("Very clean and modern apartment. The landlord speaks English which was a huge help. Location is perfect.")
                .build());

        reviewRepository.save(Review.builder()
                .author(seeker1)
                .property(p3)
                .targetUser(landlord2)
                .rating(5)
                .comment("외국인 친화적인 환경이 정말 좋아요. 이웃들도 친절하고 다국적 분위기라서 처음 일본 생활을 시작하는 분들에게 강추!")
                .build());

        reviewRepository.save(Review.builder()
                .author(seeker2)
                .property(p5)
                .targetUser(landlord1)
                .rating(4)
                .comment("Great value for money. Fully renovated and very clean. Landlord was responsive and helpful throughout the process.")
                .build());

        System.out.println("✅ DB 시드 데이터 로드 완료: 사용자 4명, 매물 6개, 리뷰 4개");
    }
}
