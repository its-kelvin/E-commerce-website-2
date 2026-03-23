--
-- Create `products` table
--
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Insert existing products into the `products` table
--
INSERT INTO `products` (`name`, `price`, `image_url`, `category`, `description`) VALUES
('Hisense 65” Smart TV', 60000, 'images/hisense.jpg', 'electronics', 'A 65-inch Smart 4K HDR TV for an immersive viewing experience.'),
('iPhone 17 Pro', 235000, 'images/iphone17.jpg', 'phones', 'The latest iPhone with a stunning display and powerful features.'),
('Samsung S25 Ultra', 150000, 'images/s25.jpg', 'phones', 'The new Samsung flagship with a pro-grade camera and vibrant display.'),
('Headphones', 2500, 'images/headphones.jpg', 'electronics', 'High-quality headphones for an immersive audio experience.'),
('Women’s Handbag', 1200, 'images/handbag.jpg', 'fashion', 'A stylish and spacious handbag for everyday use.'),
('MIKA Standing Cooker, 50cm x 60cm', 30000, 'images/cooker.jpg', 'kitchen', 'A reliable and efficient standing cooker for your kitchen.'),
('Electric Kettle', 4250, 'images/kettle.jpg', 'kitchen', 'A fast-boiling electric kettle with a modern design.'),
('Premier 50L Single Door Fridge', 20250, 'images/fridge.jpg', 'kitchen', 'A compact and energy-efficient single door fridge.'),
('Progas 6kg Complete (Cylinder + Grill + Burner)', 5500, 'images/gas.jpg', 'kitchen', 'A complete cooking gas set for your home.'),
('ACEFAST Wireless Bluetooth Earbuds', 7500, 'images/pods.jpg', 'electronics', 'True wireless earbuds with long battery life and great sound.'),
('Women High Heels', 3500, 'images/heels.jpg', 'fashion', 'Elegant high heels to complement your outfit.'),
('Home Theater Speaker', 20000, 'images/speaker.jpg', 'electronics', 'A powerful home theater system for a cinematic audio experience.'),
('Redmi Note 14 4G 8GB RAM 256GB', 23500, 'images/note14.jpg', 'phones', 'A budget-friendly smartphone with a large display and good performance.'),
('HP Victus Gaming Laptop', 115000, 'images/laptop.jpg', 'electronics', 'A powerful gaming laptop for all your favorite titles.'),
('Air Jordan Sneakers', 4500, 'images/sneaker.jpg', 'fashion', 'Classic Air Jordan sneakers for a stylish look.'),
('Led light classic tv stand', 15000, 'images/stand.jpg', 'electronics', 'A modern TV stand with built-in LED lighting.'),
('Wireless Controller for PlayStation 5', 9800, 'images/ps5 controller.jpg', 'electronics', 'The official wireless controller for the PS5.'),
('Aliyons 2.1CH woofer speaker-ELP2501', 4700, 'images/woofer.jpg', 'electronics', 'A 2.1 channel speaker system with a powerful subwoofer.');

