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
    image_urls: [] as string[],
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
    image_urls: [] as string[],
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

    const data = {
      ...bookData,
      ...(image_urls.length
        ? {
            images: {
              deleteMany: {},
              create: image_urls.map((url, sort_order) => ({ url, sort_order })),
            },
          }
        : {}),
    };

    if (existingBook) {
      await prisma.book.update({ where: { id: existingBook.id }, data });
      console.log(`Đã cập nhật: ${bookData.title}`);
    } else {
      await prisma.book.create({ data });
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