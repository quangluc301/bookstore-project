-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `email_verified` BOOLEAN NOT NULL DEFAULT true,
    `email_verification_code` VARCHAR(191) NULL,
    `email_verification_expires` DATETIME(3) NULL,
    `password_reset_code` VARCHAR(191) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Book` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `format` VARCHAR(191) NULL,
    `publisher` VARCHAR(191) NULL,
    `publication_year` INTEGER NULL,
    `description` TEXT NULL,
    `price` INTEGER NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookImage` (
    `id` VARCHAR(191) NOT NULL,
    `book_id` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BookImage_book_id_sort_order_idx`(`book_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `recipient_name` VARCHAR(191) NOT NULL DEFAULT '',
    `phone` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(512) NOT NULL DEFAULT '',
    `total_amount` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `book_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BookImage` ADD CONSTRAINT `BookImage_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `Book`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
