import os

# A lista de todos os arquivos que você precisa
arquivos = [
    "src/config/database.js",
    "src/middleware/auth.js",
    "src/middleware/errorHandler.js",
    "src/models/Order.js",
    "src/models/User.js",
    "src/routes/auth.routes.js",
    "src/routes/order.routes.js",
    "src/controllers/authController.js",
    "src/controllers/orderController.js",
    "src/utils/mapper.js",
    "src/app.js",
    "database/schema.sql",
    "docs/swagger.json",
    ".env.example",
    ".gitignore",
    "package.json",
    "README.md"
]

print("🔨 Construindo seu projeto...")

for caminho_arquivo in arquivos:
    # 1. Descobre qual é a pasta desse arquivo
    pasta = os.path.dirname(caminho_arquivo)
    
    # 2. Se a pasta não existir (ex: src/config), cria ela.
    # Se já existir, não faz nada (exist_ok=True).
    if pasta:
        os.makedirs(pasta, exist_ok=True)
    
    # 3. Cria o arquivo vazio
    with open(caminho_arquivo, 'w') as f:
        pass # 'pass' significa "não escreva nada, só crie o arquivo"

print("✅ Tudo pronto! Estrutura criada com sucesso.")