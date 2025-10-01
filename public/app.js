    /**
 * Sistema de Gerenciamento de Produtos - Interface Web com Banco de Dados
 * Implementa as Heurísticas de Usabilidade de Nielsen
 */

class ProductApp {
    constructor() {
        this.products = [];
        this.activeDiscounts = [];
        this.currentSection = 'produtos';
        this.isEditing = false;
        this.editingProductName = null;
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadProductsFromAPI();
            this.updateUI();
            this.showToast('success', 'Sistema iniciado', 'Conectado ao banco de dados MySQL!');
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showToast('error', 'Erro de inicialização', 'Problemas ao carregar o sistema');
        }
    }

    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('[data-section]').dataset.section;
                this.switchSection(section);
            });
        });

        // Verificar e configurar event listeners apenas se os elementos existem
        const setupListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Elemento ${id} não encontrado`);
            }
        };

        // Produtos
        setupListener('btn-adicionar', 'click', () => this.openProductModal());
        setupListener('btn-limpar-filtros', 'click', () => this.clearFilters());
        setupListener('btn-atualizar-stats', 'click', () => this.updateStatistics());

        // Filtros
        setupListener('filtro-categoria', 'change', () => this.applyFilters());
        setupListener('filtro-busca', 'input', () => this.applyFilters());

        // Modal
        setupListener('modal-fechar', 'click', () => this.closeModal());
        setupListener('btn-cancelar', 'click', () => this.closeModal());
        setupListener('form-produto', 'submit', (e) => this.handleProductSubmit(e));

        // Descontos  
        setupListener('btn-aplicar-categoria', 'click', () => this.applyCategoryDiscount());
        setupListener('btn-aplicar-cupom', 'click', () => this.applyCouponDiscount());
        setupListener('btn-limpar-descontos', 'click', () => this.clearDiscounts());

        // Fechar modal clicando no overlay
        const modal = document.getElementById('modal-produto');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'modal-produto') {
                    this.closeModal();
                }
            });
        }

        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            const modalElement = document.getElementById('modal-produto');
            if (e.key === 'Escape' && modalElement && modalElement.style.display === 'flex') {
                this.closeModal();
            }
        });
    }

    // === API CALLS ===

    async loadProductsFromAPI() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/products');
            const result = await response.json();
            
            if (result.success) {
                this.products = result.data.map(item => ({
                    name: item.name,
                    category: item.category,
                    price: parseFloat(item.price),
                    description: item.description || '',
                    sku: item.sku || '',
                    stock: item.stock_quantity || 0
                }));
                this.showToast('success', 'Produtos carregados', `${result.count} produtos encontrados no banco`);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showToast('error', 'Erro ao carregar produtos', error.message);
            console.error('Erro:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async addProductToAPI(productData) {
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('success', 'Produto adicionado', result.message);
                await this.loadProductsFromAPI(); // Recarregar lista
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showToast('error', 'Erro ao adicionar produto', error.message);
            return false;
        }
    }

    async removeProductFromAPI(productName) {
        try {
            const response = await fetch(`/api/products/${encodeURIComponent(productName)}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('success', 'Produto removido', result.message);
                await this.loadProductsFromAPI(); // Recarregar lista
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showToast('error', 'Erro ao remover produto', error.message);
            return false;
        }
    }

    async loadStatisticsFromAPI() {
        try {
            const response = await fetch('/api/products/stats');
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showToast('error', 'Erro ao carregar estatísticas', error.message);
            return null;
        }
    }

    // === UI MANAGEMENT ===

    switchSection(section) {
        this.currentSection = section;
        
        // Atualizar navegação
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Mostrar/ocultar seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        // Atualizar conteúdo específico da seção
        if (section === 'estatisticas') {
            this.updateStatistics();
        } else if (section === 'produtos') {
            this.updateProductsList();
        }
    }

    updateUI() {
        this.updateProductsList();
        this.updateFilters();
        this.updateStatistics();
        this.updateDiscountInfo();
    }

    updateProductsList() {
        const container = document.getElementById('produtos-lista');
        const filteredProducts = this.getFilteredProducts();

        if (filteredProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente ajustar os filtros ou adicione novos produtos</p>
                    <button class="btn btn-primary" onclick="productApp.openProductModal()">
                        Adicionar Produto
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredProducts.map(product => {
            const finalPrice = this.calculateFinalPrice(product);
            const discount = product.price - finalPrice;
            const discountPercentage = this.getTotalDiscountPercentage(product);

            return `
                <div class="product-card" data-category="${product.category}">
                    <div class="product-header">
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-actions">
                            <button class="btn-icon edit-btn" onclick="productApp.editProduct('${product.name}')" 
                                    title="Editar produto">
                                ✏️
                            </button>
                            <button class="btn-icon delete-btn" onclick="productApp.confirmDelete('${product.name}')" 
                                    title="Remover produto">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-category">
                            <span class="category-badge category-${product.category.toLowerCase()}">
                                ${this.getCategoryDisplayName(product.category)}
                            </span>
                        </div>
                        ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                        <div class="product-details">
                            <div class="product-price">
                                ${discount > 0 ? `
                                    <span class="original-price">R$ ${product.price.toFixed(2)}</span>
                                    <span class="final-price">R$ ${finalPrice.toFixed(2)}</span>
                                    <span class="discount-info">-${discountPercentage.toFixed(1)}%</span>
                                ` : `
                                    <span class="current-price">R$ ${product.price.toFixed(2)}</span>
                                `}
                            </div>
                            ${product.sku ? `<div class="product-sku">SKU: ${product.sku}</div>` : ''}
                            ${product.stock !== undefined ? `<div class="product-stock">Estoque: ${product.stock}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Atualizar contador
        const countElement = document.getElementById('produtos-count');
        if (countElement) {
            countElement.textContent = `${filteredProducts.length} produto(s) encontrado(s)`;
        }
    }

    updateFilters() {
        const categoriaSelect = document.getElementById('filtro-categoria');
        const categories = [...new Set(this.products.map(p => p.category))];
        
        categoriaSelect.innerHTML = '<option value="">Todas as categorias</option>' +
            categories.map(cat => 
                `<option value="${cat}">${this.getCategoryDisplayName(cat)}</option>`
            ).join('');
    }

    async updateStatistics() {
        if (this.currentSection !== 'estatisticas') return;

        const stats = await this.loadStatisticsFromAPI();
        if (!stats) {
            // Fallback para estatísticas locais
            const totalElement = document.getElementById('stat-total');
            const precoMedioElement = document.getElementById('stat-preco-medio');
            const maisCaroElement = document.getElementById('stat-mais-caro');
            const maisBaratoElement = document.getElementById('stat-mais-barato');
            
            if (totalElement) totalElement.textContent = this.products.length;
            if (precoMedioElement) precoMedioElement.textContent = `R$ ${this.calculateAveragePrice().toFixed(2)}`;
            if (maisCaroElement) maisCaroElement.textContent = this.getMostExpensive();
            if (maisBaratoElement) maisBaratoElement.textContent = this.getCheapest();
            
            this.updateCategoryChart(this.getProductsByCategory());
        } else {
            // Usar estatísticas da API
            const totalElement = document.getElementById('stat-total');
            const precoMedioElement = document.getElementById('stat-preco-medio');
            const maisCaroElement = document.getElementById('stat-mais-caro');
            const maisBaratoElement = document.getElementById('stat-mais-barato');
            
            if (totalElement) totalElement.textContent = stats.totalProducts;
            if (precoMedioElement) precoMedioElement.textContent = `R$ ${parseFloat(stats.averagePrice).toFixed(2)}`;
            if (maisCaroElement) maisCaroElement.textContent = stats.mostExpensiveProduct || 'N/A';
            if (maisBaratoElement) maisBaratoElement.textContent = stats.cheapestProduct || 'N/A';
            
            this.updateCategoryChart(stats.productsByCategory);
        }

        // Resumo de descontos
        this.updateDiscountSummary();
    }

    updateCategoryChart(categoryData) {
        const container = document.getElementById('chart-categorias');
        if (!container) return;
        
        const total = Object.values(categoryData).reduce((sum, count) => sum + count, 0);

        if (total === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum produto cadastrado</p>';
            return;
        }

        container.innerHTML = Object.entries(categoryData).map(([category, count]) => {
            const percentage = (count / total * 100).toFixed(1);
            return `
                <div class="chart-item">
                    <div class="chart-label">
                        <span class="category-badge category-${category.toLowerCase()}">
                            ${this.getCategoryDisplayName(category)}
                        </span>
                        <span class="chart-value">${count} (${percentage}%)</span>
                    </div>
                    <div class="chart-bar">
                        <div class="chart-fill category-${category.toLowerCase()}" 
                             style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateDiscountInfo() {
        const container = document.getElementById('descontos-ativos');
        if (!container) return;
        
        if (this.activeDiscounts.length === 0) {
            container.innerHTML = '<div class="no-discounts">Nenhum desconto ativo no momento</div>';
            return;
        }

        // Calcular total de desconto
        const totalDiscount = this.activeDiscounts.reduce((sum, discount) => sum + discount.percentage, 0);
        const limitedTotal = Math.min(totalDiscount, 100);

        let discountHtml = this.activeDiscounts.map(discount => `
            <div class="discount-item">
                <span class="discount-type">${discount.type}</span>
                <span class="discount-value">${discount.percentage}%</span>
                <button class="btn-remove-discount" onclick="productApp.removeDiscount('${discount.id}')">
                    ✕
                </button>
            </div>
        `).join('');

        // Adicionar resumo do total
        if (this.activeDiscounts.length > 1) {
            discountHtml += `
                <div class="discount-total">
                    <strong>Total: ${limitedTotal}%</strong>
                    ${totalDiscount > 100 ? '<span class="discount-warning">(limitado a 100%)</span>' : ''}
                </div>
            `;
        }

        container.innerHTML = discountHtml;
    }

    updateDiscountSummary() {
        const affectedProducts = this.products.filter(p => this.calculateFinalPrice(p) < p.price);
        const totalSavings = this.products.reduce((sum, p) => sum + (p.price - this.calculateFinalPrice(p)), 0);

        document.getElementById('produtos-com-desconto').textContent = affectedProducts.length;
        document.getElementById('economia-total').textContent = `R$ ${totalSavings.toFixed(2)}`;
    }

    getFilteredProducts() {
        const categoria = document.getElementById('filtro-categoria').value;
        const busca = document.getElementById('filtro-busca').value.toLowerCase();

        return this.products.filter(product => {
            const matchCategory = !categoria || product.category === categoria;
            const matchSearch = !busca || 
                product.name.toLowerCase().includes(busca) ||
                (product.description && product.description.toLowerCase().includes(busca));
            
            return matchCategory && matchSearch;
        });
    }

    applyFilters() {
        this.updateProductsList();
    }

    // === PRODUCT MANAGEMENT ===

    openProductModal(product = null) {
        const modal = document.getElementById('modal-produto');
        const form = document.getElementById('form-produto');
        const title = document.getElementById('modal-titulo');

        // Reset form
        form.reset();
        
        if (product) {
            // Modo edição
            this.isEditing = true;
            this.editingProductName = product.name;
            title.textContent = 'Editar Produto';
            
            document.getElementById('produto-nome').value = product.name;
            document.getElementById('produto-categoria').value = product.category;
            document.getElementById('produto-preco').value = product.price;
            
            // Campos que foram removidos no design simplificado - comentados
            // document.getElementById('produto-descricao').value = product.description || '';
            // document.getElementById('produto-sku').value = product.sku || '';
            // document.getElementById('produto-estoque').value = product.stock || 0;
        } else {
            // Modo criação
            this.isEditing = false;
            this.editingProductName = null;
            title.textContent = 'Adicionar Produto';
        }

        modal.classList.add('show');
        document.getElementById('produto-nome').focus();
    }

    closeModal() {
        const modal = document.getElementById('modal-produto');
        modal.classList.remove('show');
        this.isEditing = false;
        this.editingProductName = null;
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('nome').trim(),
            category: formData.get('categoria'),
            price: parseFloat(formData.get('preco'))
            // Campos removidos no design simplificado:
            // description: formData.get('descricao').trim(),
            // sku: formData.get('sku').trim(),
            // stock_quantity: parseInt(formData.get('estoque')) || 0
        };

        // Validações
        if (!productData.name) {
            this.showToast('error', 'Erro de validação', 'Nome do produto é obrigatório');
            return;
        }

        if (!productData.category) {
            this.showToast('error', 'Erro de validação', 'Categoria é obrigatória');
            return;
        }

        if (isNaN(productData.price) || productData.price <= 0) {
            this.showToast('error', 'Erro de validação', 'Preço deve ser um número positivo');
            return;
        }

        // Verificar duplicata (apenas para novos produtos)
        if (!this.isEditing && this.products.some(p => p.name === productData.name)) {
            this.showToast('error', 'Produto já existe', 'Já existe um produto com este nome');
            return;
        }

        const success = await this.addProductToAPI(productData);
        if (success) {
            this.closeModal();
            this.updateUI();
        }
    }

    editProduct(productName) {
        const product = this.products.find(p => p.name === productName);
        if (product) {
            this.openProductModal(product);
        }
    }

    confirmDelete(productName) {
        if (confirm(`Tem certeza que deseja remover o produto "${productName}"?`)) {
            this.removeProduct(productName);
        }
    }

    async removeProduct(productName) {
        const success = await this.removeProductFromAPI(productName);
        if (success) {
            this.updateUI();
        }
    }

    // === DISCOUNT SYSTEM ===

    applyCategoryDiscount() {
        const categoria = document.getElementById('desconto-categoria').value;
        const percentual = parseFloat(document.getElementById('desconto-percentual').value);

        if (!categoria) {
            this.showToast('error', 'Erro de validação', 'Selecione uma categoria');
            return;
        }

        if (isNaN(percentual) || percentual <= 0 || percentual > 100) {
            this.showToast('error', 'Erro de validação', 'Percentual deve ser entre 1 e 100');
            return;
        }

        // Remover desconto existente da mesma categoria
        this.activeDiscounts = this.activeDiscounts.filter(d => 
            !(d.type === 'Categoria' && d.category === categoria)
        );

        // Adicionar novo desconto
        this.activeDiscounts.push({
            id: `category_${categoria}_${Date.now()}`,
            type: 'Categoria',
            category: categoria,
            percentage: percentual
        });

        this.showToast('success', 'Desconto aplicado', 
            `${percentual}% de desconto aplicado em ${this.getCategoryDisplayName(categoria)}`);
        
        this.updateUI();
        
        // Limpar form
        document.getElementById('desconto-percentual').value = '';
    }

    applyCouponDiscount() {
        const percentual = parseFloat(document.getElementById('cupom-percentual').value);

        if (isNaN(percentual) || percentual <= 0 || percentual > 100) {
            this.showToast('error', 'Erro de validação', 'Percentual deve ser entre 1 e 100');
            return;
        }

        // Remover cupom existente
        this.activeDiscounts = this.activeDiscounts.filter(d => d.type !== 'Cupom');

        // Adicionar novo cupom
        this.activeDiscounts.push({
            id: `coupon_${Date.now()}`,
            type: 'Cupom',
            percentage: percentual
        });

        this.showToast('success', 'Cupom aplicado', 
            `${percentual}% de desconto aplicado em todos os produtos`);
        
        this.updateUI();
        
        // Limpar form
        document.getElementById('cupom-percentual').value = '';
    }

    removeDiscount(discountId) {
        this.activeDiscounts = this.activeDiscounts.filter(d => d.id !== discountId);
        this.showToast('success', 'Desconto removido', 'Desconto foi removido com sucesso');
        this.updateUI();
    }

    clearDiscounts() {
        if (this.activeDiscounts.length === 0) {
            this.showToast('info', 'Nenhum desconto', 'Não há descontos ativos para remover');
            return;
        }

        this.activeDiscounts = [];
        this.showToast('success', 'Descontos removidos', 'Todos os descontos foram removidos');
        this.updateUI();
    }

    clearFilters() {
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('filtro-busca').value = '';
        this.updateProductsList();
        this.showToast('success', 'Filtros limpos', 'Todos os filtros foram removidos');
    }

    // === CALCULATIONS ===

    calculateFinalPrice(product) {
        let finalPrice = product.price;
        let totalDiscountPercentage = 0;

        // Buscar descontos ativos para o produto
        const categoryDiscount = this.activeDiscounts.find(d => 
            d.type === 'Categoria' && d.category === product.category
        );
        const couponDiscount = this.activeDiscounts.find(d => d.type === 'Cupom');

        // Aplicar desconto SIMPLES (soma dos percentuais)
        if (categoryDiscount) {
            totalDiscountPercentage += categoryDiscount.percentage;
        }
        if (couponDiscount) {
            totalDiscountPercentage += couponDiscount.percentage;
        }

        // Limitar desconto máximo a 100%
        totalDiscountPercentage = Math.min(totalDiscountPercentage, 100);

        // Aplicar desconto total
        finalPrice = product.price * (1 - totalDiscountPercentage / 100);

        return finalPrice;
    }

    getTotalDiscountPercentage(product) {
        let totalDiscountPercentage = 0;

        // Buscar descontos ativos para o produto
        const categoryDiscount = this.activeDiscounts.find(d => 
            d.type === 'Categoria' && d.category === product.category
        );
        const couponDiscount = this.activeDiscounts.find(d => d.type === 'Cupom');

        // Somar percentuais
        if (categoryDiscount) {
            totalDiscountPercentage += categoryDiscount.percentage;
        }
        if (couponDiscount) {
            totalDiscountPercentage += couponDiscount.percentage;
        }

        // Limitar desconto máximo a 100%
        return Math.min(totalDiscountPercentage, 100);
    }

    calculateAveragePrice() {
        if (this.products.length === 0) return 0;
        const total = this.products.reduce((sum, p) => sum + p.price, 0);
        return total / this.products.length;
    }

    getMostExpensive() {
        if (this.products.length === 0) return 'N/A';
        return this.products.reduce((max, p) => p.price > max.price ? p : max).name;
    }

    getCheapest() {
        if (this.products.length === 0) return 'N/A';
        return this.products.reduce((min, p) => p.price < min.price ? p : min).name;
    }

    getProductsByCategory() {
        const categories = {};
        this.products.forEach(product => {
            categories[product.category] = (categories[product.category] || 0) + 1;
        });
        return categories;
    }

    // === UTILITIES ===

    getCategoryDisplayName(category) {
        const displayNames = {
            'eletronicos': 'Eletrônicos',
            'livros': 'Livros',
            'alimentos': 'Alimentos',
            'roupas': 'Roupas',
            'casa': 'Casa e Decoração',
            'outros': 'Outros'
        };
        return displayNames[category.toLowerCase()] || category;
    }

    showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });
    }

    showLoading(show) {
        const overlay = document.getElementById('loading');
        if (show) {
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }
}

// === INICIALIZAÇÃO ===

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    window.productApp = new ProductApp();
    
    // Verificar status da API
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            console.log('Status da API:', data);
            if (data.database !== 'connected') {
                productApp.showToast('warning', 'Aviso', 'Banco de dados não conectado');
            }
        })
        .catch(error => {
            console.error('Erro ao verificar status:', error);
            productApp.showToast('error', 'Erro', 'Não foi possível conectar com a API');
        });
});

// === TRATAMENTO DE ERROS GLOBAIS ===
window.addEventListener('error', (e) => {
    console.error('Erro global:', e.error);
    if (window.productApp) {
        window.productApp.showToast('error', 'Erro inesperado', 'Algo deu errado. Verifique o console.');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejeitada:', e.reason);
    if (window.productApp) {
        window.productApp.showToast('error', 'Erro de conexão', 'Problema na comunicação com o servidor');
    }
});