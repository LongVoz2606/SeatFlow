-- Event Service: V5 - Add Category and Seed 100 events

-- 1. Thêm cột category vào bảng events nếu chưa tồn tại
ALTER TABLE events ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'Music';

-- 2. Đăng ký thông tin 5 nhà tổ chức mẫu (Không chèn trực tiếp vào auth_users/user_profiles tại đây để tránh race condition)
INSERT INTO organizers (id, auth_user_id, organization_name, description, contact_email, status) VALUES
(10, 10, 'Music Production Group', 'Đơn vị tổ chức các show ca nhạc, live concert hàng đầu Việt Nam.', 'music@seatflow.com', 'APPROVED'),
(11, 11, 'Vietnam Tech Events', 'Tổ chức các hội thảo công nghệ, hội thảo AI & Blockchain quy mô quốc gia.', 'tech@seatflow.com', 'APPROVED'),
(12, 12, 'Arts & Stage Theater', 'Đơn vị bảo tồn nghệ thuật sân khấu, kịch nói và nhạc kịch đương đại.', 'art@seatflow.com', 'APPROVED'),
(13, 13, 'National Sports Agency', 'Đơn vị quản lý và tổ chức các sự kiện thể thao, chạy marathon lớn nhất cả nước.', 'sports@seatflow.com', 'APPROVED'),
(14, 14, 'Entertainment & Festival Inc.', 'Chuyên gia tổ chức các lễ hội ẩm thực, Comic Con và triển lãm giải trí.', 'festivals@seatflow.com', 'APPROVED')
ON CONFLICT (id) DO NOTHING;

SELECT setval('organizers_id_seq', COALESCE((SELECT MAX(id) FROM organizers), 1));

-- 3. Tạo tự động 100 sự kiện và ghế ngồi bằng khối lệnh PL/pgSQL
DO $$
DECLARE
    i INT;
    event_id_val BIGINT;
    cat_val VARCHAR(50);
    title_val VARCHAR(255);
    desc_val TEXT;
    loc_val VARCHAR(255);
    img_val VARCHAR(500);
    org_id_val BIGINT;
    is_hot_val BOOLEAN;
    date_val TIMESTAMP WITH TIME ZONE;
    
    -- Mảng dữ liệu tạo sự kiện phong phú
    titles_music VARCHAR[] := ARRAY[
        'Live Concert: Mỹ Tâm Soul', 'Rap Việt Live Concert 2026', 'Chill Acoustic Sunset', 
        'Modern Rock Show: Lửa Đêm', 'EDM Wave Electronic Festival', 'Bolero Đêm Nhạc Xưa', 
        'Jazz & Wine Nights', 'K-Pop Fever Festival', 'Indie Soul Concert', 'Classical Symphony Night'
    ];
    
    titles_tech VARCHAR[] := ARRAY[
        'AI & Future Tech Summit', 'Cloud Computing Seminar 2026', 'Cyber Security Roundtable', 
        'Blockchain Ecosystem Expo', 'DevOps Days Vietnam', 'Tech Startup Founder Talk', 
        'Mobile App Dev Masterclass', 'UI/UX Design Trends 2026', 'Frontend Masters Workshop', 'Data Science & Big Data Bootcamp'
    ];
    
    titles_art VARCHAR[] := ARRAY[
        'Kịch Nói: Đèn Khuya Hà Nội', 'Triển Lãm Tranh: Sắc Thu', 'Múa Đương Đại: Cát Bụi', 
        'Nhạc Kịch: Romeo & Juliet', 'Opera: The Magic Flute', 'Triển Lãm Điêu Khắc Đương Đại', 
        'Sơn Mài Việt Nam Show', 'Kịch Hài: Tiếng Cười Đêm Đông', 'Puppet Show: Water Legends', 'Nhạc Kịch: Les Misérables'
    ];
    
    titles_sports VARCHAR[] := ARRAY[
        'Hanoi Midnight Marathon 2026', 'Saigon Football Cup', 'National Badminton Open', 
        'VBA Basketball Night', 'Saigon Cycling Challenge', 'Tennis Masters Championship', 
        'MMA Warrior Fight Night', 'Vietnam Golf Open', 'National Swimming Cup', 'Yoga & Wellness Festival'
    ];
    
    titles_ent VARCHAR[] := ARRAY[
        'Food & Beverage Festival 2026', 'Comic Con Vietnam', 'Carnival Street Parade', 
        'Halloween Costume Night', 'Beer & Rock Fest', 'Stand-up Comedy Night', 
        'Magic & Illusion Show', 'Game On Esports Expo', 'Anime & Cosplay Gala', 'New Year Countdown Party'
    ];

    cities VARCHAR[] := ARRAY['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Hải Phòng', 'Vũng Tàu', 'Huế', 'Cần Thơ', 'Phú Quốc'];
    venues VARCHAR[] := ARRAY['Trung tâm Hội nghị', 'Nhà hát Lớn', 'Nhà thi đấu', 'Sân vận động', 'Công viên Văn hóa', 'Khách sạn Plaza', 'Nhà triển lãm'];

    -- Hình ảnh Unsplash ngẫu nhiên theo danh mục để UI sống động
    banners_music VARCHAR[] := ARRAY[
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
        'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800'
    ];
    banners_tech VARCHAR[] := ARRAY[
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
    ];
    banners_art VARCHAR[] := ARRAY[
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
        'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'
    ];
    banners_sports VARCHAR[] := ARRAY[
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
        'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800'
    ];
    banners_ent VARCHAR[] := ARRAY[
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
    ];

BEGIN
    -- Vòng lặp tạo 100 sự kiện từ id = 10 đến 109
    FOR i IN 1..100 LOOP
        event_id_val := 10 + i;
        
        -- Phân bổ danh mục và tên sự kiện
        IF i % 5 = 1 THEN
            cat_val := 'Music';
            title_val := titles_music[(i % 10) + 1] || ' (Show ' || ((i / 10) + 1) || ')';
            desc_val := 'Hòa mình vào không gian âm nhạc hoành tráng và đầy cảm xúc. Sự kiện âm nhạc được đầu tư công phu với sự tham gia của các nghệ sĩ nổi tiếng.';
            img_val := banners_music[(i % 3) + 1];
            org_id_val := 10;
        ELSIF i % 5 = 2 THEN
            cat_val := 'Tech & Seminar';
            title_val := titles_tech[(i % 10) + 1] || ' ' || (2026 + (i % 3));
            desc_val := 'Nơi chia sẻ kiến thức chuyên sâu từ các chuyên gia đầu ngành công nghệ. Đăng ký tham gia ngay để cập nhật xu hướng và kết nối mạng lưới.';
            img_val := banners_tech[(i % 3) + 1];
            org_id_val := 11;
        ELSIF i % 5 = 3 THEN
            cat_val := 'Arts & Theater';
            title_val := titles_art[(i % 10) + 1];
            desc_val := 'Trải nghiệm những khoảnh khắc nghệ thuật đỉnh cao, lay động mọi giác quan. Show diễn kết hợp ánh sáng và diễn xuất tinh tế.';
            img_val := banners_art[(i % 3) + 1];
            org_id_val := 12;
        ELSIF i % 5 = 4 THEN
            cat_val := 'Sports';
            title_val := titles_sports[(i % 10) + 1] || ' Series';
            desc_val := 'Sân chơi thể thao rèn luyện sức bền và ý chí phi thường. Cùng bứt phá giới hạn bản thân và đạt những kỷ lục mới.';
            img_val := banners_sports[(i % 3) + 1];
            org_id_val := 13;
        ELSE
            cat_val := 'Entertainment';
            title_val := titles_ent[(i % 10) + 1];
            desc_val := 'Lễ hội vui chơi giải trí đầy màu sắc dành cho giới trẻ và gia đình. Nhiều gian hàng ẩm thực, trò chơi và âm nhạc sôi động.';
            img_val := banners_ent[(i % 3) + 1];
            org_id_val := 14;
        END IF;

        -- Địa điểm và ngày diễn ra
        loc_val := venues[(i % 7) + 1] || ', ' || cities[(i % 10) + 1];
        date_val := NOW() + (i * INTERVAL '1 day') + (i * INTERVAL '2 hours');
        
        -- Xác định sự kiện hot (khoảng 15% là HOT)
        is_hot_val := (i % 7 = 0);

        -- Chèn sự kiện
        INSERT INTO events (id, title, description, location, event_date, banner_url, total_seats, available_seats, status, organizer_id, is_hot, category)
        VALUES (event_id_val, title_val, desc_val, loc_val, date_val, img_val, 20, 20, 'ACTIVE', org_id_val, is_hot_val, cat_val)
        ON CONFLICT (id) DO NOTHING;

        -- Tạo 20 ghế trống (A1-A10: VIP 1.500.000, B1-B10: REGULAR 600.000)
        INSERT INTO seats (event_id, seat_number, seat_row, seat_type, price, status, version) VALUES
        (event_id_val, 'A1', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A2', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A3', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A4', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A5', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A6', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A7', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A8', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A9', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'A10', 'A', 'VIP', 1500000.00, 'AVAILABLE', 0),
        (event_id_val, 'B1', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B2', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B3', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B4', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B5', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B6', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B7', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B8', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B9', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0),
        (event_id_val, 'B10', 'B', 'REGULAR', 600000.00, 'AVAILABLE', 0)
        ON CONFLICT (event_id, seat_number) DO NOTHING;

    END LOOP;
END $$;

-- 4. Đồng bộ sequence cho các bảng để tránh lỗi chèn tự động ID sau này
SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 1));

-- 5. Cập nhật lại khoảng giá cho tất cả các sự kiện
UPDATE events e SET
  min_price = COALESCE((SELECT MIN(price) FROM seats WHERE event_id = e.id), 0),
  max_price = COALESCE((SELECT MAX(price) FROM seats WHERE event_id = e.id), 0);
