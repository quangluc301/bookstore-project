import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const { hashPassword } = require('../src/utils/hashPassword') as {
  hashPassword: (password: string) => Promise<string>;
};

const sampleBooks = [
  {
    title: 'Lập trình Web cơ bản',
    author: 'Nguyễn Văn A',
    category: 'Công nghệ thông tin',
    format: 'Bìa mềm',
    publisher: 'NXB Thống Kê',
    publication_year: 2023,
    price: 150000,
    stock: 50,
    description: 'Cuốn sách cơ bản hướng dẫn lập trình web từ đầu dành cho người mới bắt đầu.',
    image_urls: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Học máy từ căn bản đến nâng cao',
    author: 'Trần Văn B',
    category: 'Trí tuệ nhân tạo',
    format: 'Bìa cứng',
    publisher: 'NXB Giáo Dục',
    publication_year: 2024,
    price: 250000,
    stock: 30,
    description: 'Tài liệu học máy, trí tuệ nhân tạo từ căn bản đến nâng cao với các thuật toán phổ biến.',
    image_urls: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Tâm lý học hành vi',
    author: 'Lệnh Hồ Xung',
    category: 'Kỹ năng sống',
    format: 'Bìa mềm',
    publisher: 'NXB Tổng Hợp',
    publication_year: 2022,
    price: 120000,
    stock: 100,
    description: 'Khám phá hành vi tâm lý con người trong đời sống hàng ngày và xã hội hiện đại.',
    image_urls: ['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Clean Code: Mã sạch',
    author: 'Robert C. Martin',
    category: 'Công nghệ thông tin',
    format: 'Bìa cứng',
    publisher: 'NXB Lao Động',
    publication_year: 2021,
    price: 280000,
    stock: 45,
    description: 'Nghệ thuật viết mã nguồn mở, dễ đọc, dễ bảo trì cho lập trình viên chuyên nghiệp.',
    image_urls: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'JavaScript Nâng Cao',
    author: 'Đặng Văn C',
    category: 'Công nghệ thông tin',
    format: 'Bìa mềm',
    publisher: 'NXB Khoa Học Kỹ Thuật',
    publication_year: 2023,
    price: 180000,
    stock: 60,
    description: 'Làm chủ các khái niệm cốt lõi, bất đồng bộ, Closures và Prototype trong JavaScript.',
    image_urls: ['https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    category: 'Kỹ năng sống',
    format: 'Bìa mềm',
    publisher: 'NXB Tổng Hợp TP.HCM',
    publication_year: 2020,
    price: 86000,
    stock: 120,
    description: 'Cuốn sách nổi tiếng nhất mọi thời đại về nghệ thuật thu phục lòng người và giao tiếp ứng xử.',
    image_urls: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    category: 'Văn học',
    format: 'Bìa mềm',
    publisher: 'NXB Văn Học',
    publication_year: 2019,
    price: 79000,
    stock: 90,
    description: 'Hành trình theo đuổi vận mệnh của cậu bé chăn cừu Santiago đầy cảm hứng và ý nghĩa triết lý.',
    image_urls: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Tư Duy Nhanh Và Chậm',
    author: 'Daniel Kahneman',
    category: 'Kinh tế - Tâm lý',
    format: 'Bìa cứng',
    publisher: 'NXB Thế Giới',
    publication_year: 2021,
    price: 220000,
    stock: 40,
    description: 'Khám phá hai hệ thống tư duy chi phối cách con người đưa ra quyết định hàng ngày.',
    image_urls: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Thiết Kế Cơ Sở Dữ Liệu',
    author: 'Phạm Văn D',
    category: 'Công nghệ thông tin',
    format: 'Bìa mềm',
    publisher: 'NXB Đại học Quốc Gia',
    publication_year: 2022,
    price: 160000,
    stock: 55,
    description: 'Hướng dẫn chuẩn hóa cơ sở dữ liệu quan hệ, thiết kế mô hình ERD và tối ưu truy vấn SQL.',
    image_urls: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'ReactJS Từ Cơ Bản Đến Thực Chiến',
    author: 'Hoàng Văn E',
    category: 'Công nghệ thông tin',
    format: 'Bìa mềm',
    publisher: 'NXB Thông Tin và Truyền Thông',
    publication_year: 2024,
    price: 210000,
    stock: 75,
    description: 'Xây dựng ứng dụng web hiện đại với React Hooks, Context API và các thư viện phổ biến.',
    image_urls: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Python Cho Phân Tích Dữ Liệu',
    author: 'Vũ Thị F',
    category: 'Khoa học dữ liệu',
    format: 'Bìa cứng',
    publisher: 'NXB Khoa Học Kỹ Thuật',
    publication_year: 2023,
    price: 230000,
    stock: 65,
    description: 'Sử dụng Pandas, NumPy và Matplotlib để xử lý, phân tích và trực quan hóa dữ liệu thực tế.',
    image_urls: ['https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
    author: 'Rosie Nguyễn',
    category: 'Kỹ năng sống',
    format: 'Bìa mềm',
    publisher: 'NXB Hội Nhà Văn',
    publication_year: 2018,
    price: 80000,
    stock: 110,
    description: 'Lời khuyên chân thành dành cho người trẻ về học tập, trải nghiệm và định hướng tương lai.',
    image_urls: ['https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Sapiens: Lược Sử Loài Người',
    author: 'Yuval Noah Harari',
    category: 'Lịch sử - Xã hội',
    format: 'Bìa cứng',
    publisher: 'NXB Tri Thức',
    publication_year: 2019,
    price: 290000,
    stock: 35,
    description: 'Hành trình từ một loài vượn không có gì nổi trội trở thành bá chủ hành tinh Trái Đất.',
    image_urls: ['https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Bắt Trẻ Đồng Xanh',
    author: 'J.D. Salinger',
    category: 'Văn học',
    format: 'Bìa mềm',
    publisher: 'NXB Văn Học',
    publication_year: 2017,
    price: 95000,
    stock: 50,
    description: 'Tác phẩm kinh điển về tuổi thiếu niên, sự cô đơn và khát vọng tìm kiếm bản ngã.',
    image_urls: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Giải Thuật Và Lập Trình',
    author: 'Lê Minh H',
    category: 'Công nghệ thông tin',
    format: 'Bìa cứng',
    publisher: 'NXB Giáo Dục',
    publication_year: 2021,
    price: 190000,
    stock: 40,
    description: 'Tuyển tập các thuật toán cốt lõi, quy hoạch động và cấu trúc dữ liệu nâng cao.',
    image_urls: ['https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Giao Tiếp Hiệu Quả Trong Công Việc',
    author: 'Ian Tuhovsky',
    category: 'Kỹ năng sống',
    format: 'Bìa mềm',
    publisher: 'NXB Lao Động Xã Hội',
    publication_year: 2022,
    price: 110000,
    stock: 80,
    description: 'Bí quyết cải thiện kỹ năng thuyết trình, lắng nghe và đàm phán thành công nơi công sở.',
    image_urls: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'NodeJS Backend Chuyên Sâu',
    author: 'Nguyễn Văn G',
    category: 'Công nghệ thông tin',
    format: 'Bìa mềm',
    publisher: 'NXB Thống Kê',
    publication_year: 2024,
    price: 240000,
    stock: 50,
    description: 'Xây dựng RESTful API bảo mật, xử lý tiến trình ngầm và kết nối Microservices với NodeJS.',
    image_urls: ['https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Nhà Kinh Tế Vi Mô Hành Vi',
    author: 'Richard H. Thaler',
    category: 'Kinh tế',
    format: 'Bìa cứng',
    publisher: 'NXB Kinh Tế Quốc Dân',
    publication_year: 2020,
    price: 260000,
    stock: 25,
    description: 'Cách tâm lý học định hình các quyết định tài chính và thị trường kinh tế học hiện đại.',
    image_urls: ['https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Khởi Nghiệp Tinh Gọn',
    author: 'Eric Ries',
    category: 'Kinh doanh',
    format: 'Bìa mềm',
    publisher: 'NXB Trẻ',
    publication_year: 2019,
    price: 135000,
    stock: 70,
    description: 'Phương pháp quản trị khởi nghiệp thành công thông qua kiểm nghiệm liên tục và tối ưu sản phẩm.',
    image_urls: ['https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80'],
  },
  {
    title: 'Bảo Mật Ứng Dụng Web',
    author: 'Trần Văn K',
    category: 'An toàn thông tin',
    format: 'Bìa cứng',
    publisher: 'NXB Khoa Học Kỹ Thuật',
    publication_year: 2024,
    price: 310000,
    stock: 20,
    description: 'Nhận diện các lỗ hổng bảo mật phổ biến OWASP Top 10 và cách phòng chống tấn công mạng.',
    image_urls: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'],
  },
];

function validateImageUrls(imageUrls: string[]) {
  if (imageUrls.length > 4) throw new Error('Mỗi sách chỉ được có tối đa 4 URL ảnh.');

  for (const imageUrl of imageUrls) {
    const url = new URL(imageUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`URL ảnh không hợp lệ: ${imageUrl}`);
    }
  }
}

async function main() {
  for (const { image_urls, ...bookData } of sampleBooks) {
    validateImageUrls(image_urls);

    const existingBook = await prisma.book.findFirst({
      where: { title: bookData.title, author: bookData.author },
    });

    if (existingBook) {
      await prisma.book.update({
        where: { id: existingBook.id },
        data: {
          ...bookData,
          ...(image_urls.length
            ? {
                images: {
                  deleteMany: {},
                  create: image_urls.map((url, sort_order) => ({ url, sort_order })),
                },
              }
            : {}),
        },
      });
      console.log(`Đã cập nhật: ${bookData.title}`);
    } else {
      await prisma.book.create({
        data: {
          ...bookData,
          ...(image_urls.length
            ? {
                images: {
                  create: image_urls.map((url, sort_order) => ({ url, sort_order })),
                },
              }
            : {}),
        },
      });
      console.log(`Đã thêm: ${bookData.title}`);
    }
  }

  const sampleEmail = 'nguyenvana@gmail.com';
  let sampleUser = await prisma.user.findUnique({ where: { email: sampleEmail } });
  if (!sampleUser) {
    const password = process.env.SEED_SAMPLE_USER_PASSWORD || 'Reader123!';
    sampleUser = await prisma.user.create({
      data: {
        email: sampleEmail,
        password_hash: await hashPassword(password),
        full_name: 'Nguyễn Văn A',
        role: 'USER',
        email_verified: true,
      },
    });
    console.log(`Đã thêm user mẫu: ${sampleEmail}`);
  } else {
    console.log(`Giữ nguyên user hiện có: ${sampleEmail}`);
  }

  const [firstBook, secondBook] = await Promise.all([
    prisma.book.findFirst({ where: { title: sampleBooks[0].title, author: sampleBooks[0].author } }),
    prisma.book.findFirst({ where: { title: sampleBooks[1].title, author: sampleBooks[1].author } }),
  ]);
  if (!firstBook || !secondBook) throw new Error('Không tìm thấy sách để tạo đơn mẫu.');

  const sampleOrderDetails = {
    user_id: sampleUser.id,
    recipient_name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
  };
  const existingOrder = await prisma.order.findFirst({ where: sampleOrderDetails });

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        ...sampleOrderDetails,
        total_amount: firstBook.price + secondBook.price,
        status: 'PENDING',
        items: {
          create: [
            { book_id: firstBook.id, title: firstBook.title, quantity: 1, unit_price: firstBook.price },
            { book_id: secondBook.id, title: secondBook.title, quantity: 1, unit_price: secondBook.price },
          ],
        },
      },
    });
    console.log('Đã thêm đơn hàng mẫu gồm hai sách.');
  } else {
    console.log('Giữ nguyên đơn hàng mẫu hiện có.');
  }

  console.log('Nạp dữ liệu sách, user và đơn hàng mẫu hoàn tất.');
}

main()
  .catch((error) => {
    console.error('Lỗi khi nạp dữ liệu sách:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });