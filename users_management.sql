CREATE DATABASE user_management;
USE user_management;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM users;
DESCRIBE users;
ALTER TABLE users ADD COLUMN telefone VARCHAR(15) AFTER password_hash;
ALTER TABLE users ADD COLUMN cpf VARCHAR(14) NOT NULL UNIQUE AFTER full_name;


ALTER TABLE users
ADD COLUMN user_type ENUM('locador', 'locatario') NOT NULL AFTER password_hash;


CREATE TABLE imoveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    localidade VARCHAR(100),
    quartos INT,
    banheiros INT,
    area DECIMAL(10,2),
    preco DECIMAL(15,2),
    descricao TEXT,
    endereco VARCHAR(255),
    imagem_principal VARCHAR(255),
    outras_imagens TEXT
);

INSERT INTO imoveis (tipo, localidade, endereco, quartos, banheiros, area, preco, descricao, imagem_principal, outras_imagens)
VALUES
('Casa', 'Brasília - DF', 'Quadra 12 Conjunto H, Jardim Botânico', 3, 2, 288.00, 11500.00, 'Casa espaçosa com ótimo acabamento.', './img/aluguel1.jpg', './img/aluguel1.1.jpg'),
('Apartamento', 'Brasília - DF', 'SQNW 310, Noroeste', 3, 2, 118.00, 8700.00, 'Apartamento moderno com suíte e varanda.', './img/aluguel2.jpg', './img/aluguel2.1.jpg'),
('Apartamento', 'Cabo de Santo Agostinho - PE', 'Rua Dos Sapotis, 307', 4, 4, 238.00, 15400.00, 'Apartamento com vista para o mar e suítes.', './img/aluguel3.jpg', './img/aluguel3.1.jpg');

INSERT INTO imoveis (tipo, localidade, endereco, quartos, banheiros, area, preco, imagem_principal, outras_imagens, descricao)
VALUES
('Apartamento', 'Balneário Camboriú - SC', 'Avenida Atlântica, 3900', 3, NULL, 446.00, 17500.00, './img/aluguel4.jpg', './img/aluguel4.jpg,imagem11.jpg,imagem12.jpg', 'Apartamento espaçoso com 3 quartos e excelente localização.'),
('Apartamento', 'São Paulo - SP', 'Cobertura Na Rua Canário, MOEMA', 4, NULL, 350.00, 20500.00, './img/aluguel5.webp', './img/aluguel5.1.webp,imagem11.jpg,imagem12.jpg', 'Cobertura de luxo com 4 quartos e vista panorâmica.'),
('Apartamento', 'Florianópolis - SC', 'Rua Deputado Paulo Preis, Jurerê', 4, NULL, 150.00, 15500.00, './img/aluguel6.webp', './img/aluguel6.1.webp,imagem11.jpg,imagem12.jpg', 'Apartamento moderno em Jurerê, Florianópolis.'),
('Casa', 'Balneário Camboriú - SC', 'Rua 3130, 112, Centro', 4, NULL, 286.00, 300000.00, './img/vendas2.jpg', './img/vendas2.1.jpg', 'Casa charmosa no centro de Balneário Camboriú.'),
('Apartamento', 'Cabo de Santo Agostinho - PE', 'Casa no Condomínio Morada da Península', 4, 4, 750.00, 8000000.00, './img/vendas3.jpg', './img/vendas3.1.jpg,imagem5.jpg,imagem6.jpg', 'Casa de alto padrão com 4 suítes e vista exclusiva.'),
('Apartamento', 'Brasília - DF', 'QD 19 park way', 3, 5, 1875.00, 2800000.00, './img/vendas4.jpg', './img/vendas4.1.jpg,imagem8.jpg,imagem9.jpg', 'Casa espaçosa no Park Way, Brasília.'),
('Terreno', 'Brasília - DF', 'Terreno - SMLN MI 07 Conjunto 4, Lago Norte', NULL, NULL, 1200.00, 1100000.00, './img/vendas5.jpg', './img/vendas5.1.jpg,imagem11.jpg,imagem12.jpg', 'Terreno amplo e bem localizado no Lago Norte.'),
('Apartamento', 'São Paulo - SP', 'Cobertura Na Rua Canário, MOEMA', 4, NULL, 150.00, 250000.00, './img/vendas6.jpg', './img/vendas6.1.jpg,imagem11.jpg,imagem12.jpg', 'Cobertura exclusiva em Moema, São Paulo.'),
('Apartamento', 'Brasília - DF', 'Rua Hudson Neves, Setor Comercial Sul', 4, NULL, 254.00, 10500000.00, './img/venda.1.jpg', './img/venda.1.1.jpg,imagem11.jpg,imagem12.jpg', 'Apartamento sofisticado no Setor Comercial Sul de Brasília.');

select * from imoveis;
