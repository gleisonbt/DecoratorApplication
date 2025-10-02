/**
 * Sistema de Gerenciamento de Produtos - Interface Web com Banco de Dados
 * Implementa as Heurísticas de Usabilidade de Nielsen
 * Agora com Sistema de Filtros usando Padrão Decorator
 */

// === PADRÃO DECORATOR PARA FILTROS ===

/**
 * Interface base para filtros de produtos (simulada em JavaScript)
 */
class ProductFilter {
    filter(products) {
        throw new Error('Método filter deve ser implementado');
    }
    
    getDescription() {
        throw new Error('Método getDescription deve ser implementado');
    }
}

/**
 * Filtro base - não aplica nenhuma filtragem
 */
class BaseFilter extends ProductFilter {
    filter(products) {
        return [...products]; // Retorna cópia de todos os produtos
    }
    
    getDescription() {
        return 'Filtro base (sem filtragem)';
    }
}

/**
 * Decorator abstrato base para filtros
 */
class FilterDecorator extends ProductFilter {
    constructor(filter) {
        super();
        this.wrappedFilter = filter;
    }
    
    filter(products) {
        // Aplica primeiro o filtro wrapeado, depois o próprio filtro
        const filteredByWrapped = this.wrappedFilter.filter(products);
        return this.applyFilter(filteredByWrapped);
    }
    
    getDescription() {
        return `${this.wrappedFilter.getDescription()} + ${this.getOwnDescription()}`;
    }
    
    // Métodos abstratos que devem ser implementados pelos decorators concretos
    applyFilter(products) {
        throw new Error('Método applyFilter deve ser implementado');
    }
    
    getOwnDescription() {
        throw new Error('Método getOwnDescription deve ser implementado');
    }
}

/**
 * Decorator para filtrar produtos por categoria
 */
class CategoryFilter extends FilterDecorator {
    constructor(filter, category = null) {
        super(filter);
        this.category = category;
    }
    
    setCategory(category) {
        this.category = category;
    }
    
    applyFilter(products) {
        if (!this.category) {
            return products; // Sem categoria selecionada, retorna todos
        }
        
        return products.filter(product => product.category === this.category);
    }
    
    getOwnDescription() {
        return this.category ? `Categoria: ${this.category}` : 'Categoria: Todas';
    }
}

/**
 * Decorator para filtrar produtos por busca textual
 */
class SearchFilter extends FilterDecorator {
    constructor(filter, searchTerm = '') {
        super(filter);
        this.searchTerm = searchTerm.toLowerCase();
    }
    
    setSearchTerm(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
    }
    
    applyFilter(products) {
        if (!this.searchTerm.trim()) {
            return products; // Sem termo de busca, retorna todos
        }
        
        return products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(this.searchTerm);
            const descriptionMatch = product.description?.toLowerCase().includes(this.searchTerm) || false;
            
            return nameMatch || descriptionMatch;
        });
    }
    
    getOwnDescription() {
        return this.searchTerm ? `Busca: "${this.searchTerm}"` : 'Busca: Vazia';
    }
}

/**
 * Decorator para filtrar produtos por faixa de preço
 */
class PriceRangeFilter extends FilterDecorator {
    constructor(filter, minPrice = 0, maxPrice = Number.MAX_VALUE) {
        super(filter);
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }
    
    setPriceRange(minPrice, maxPrice) {
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }
    
    applyFilter(products) {
        return products.filter(product => 
            product.price >= this.minPrice && product.price <= this.maxPrice
        );
    }
    
    getOwnDescription() {
        if (this.minPrice === 0 && this.maxPrice === Number.MAX_VALUE) {
            return 'Preço: Todos';
        }
        return `Preço: R$ ${this.minPrice.toFixed(2)} - R$ ${this.maxPrice.toFixed(2)}`;
    }
}

/**
 * Decorator para filtrar produtos com desconto
 */
class DiscountFilter extends FilterDecorator {
    constructor(filter, onlyWithDiscount = false, priceCalculatorFn = null) {
        super(filter);
        this.onlyWithDiscount = onlyWithDiscount;
        this.priceCalculatorFn = priceCalculatorFn;
    }
    
    setDiscountFilter(onlyWithDiscount) {
        this.onlyWithDiscount = onlyWithDiscount;
    }
    
    setPriceCalculator(priceCalculatorFn) {
        this.priceCalculatorFn = priceCalculatorFn;
    }
    
    applyFilter(products) {
        if (!this.onlyWithDiscount || !this.priceCalculatorFn) {
            return products; // Sem filtro de desconto
        }
        
        return products.filter(product => {
            const finalPrice = this.priceCalculatorFn(product);
            return finalPrice < product.price; // Tem desconto se preço final < preço original
        });
    }
    
    getOwnDescription() {
        return this.onlyWithDiscount ? 'Apenas com desconto' : 'Todos os produtos';
    }
}

/**
 * Factory para criar filtros compostos
 */
class FilterFactory {
    static createCategoryAndSearchFilter(category, searchTerm) {
        let filter = new BaseFilter();
        
        if (category) {
            filter = new CategoryFilter(filter, category);
        }
        
        if (searchTerm?.trim()) {
            filter = new SearchFilter(filter, searchTerm);
        }
        
        return filter;
    }
    
    static createCompleteFilter(category, searchTerm, minPrice, maxPrice, onlyWithDiscount, priceCalculatorFn) {
        let filter = new BaseFilter();
        
        // Aplicar filtros em ordem lógica
        if (category) {
            filter = new CategoryFilter(filter, category);
        }
        
        if (searchTerm?.trim()) {
            filter = new SearchFilter(filter, searchTerm);
        }
        
        if (minPrice !== undefined && maxPrice !== undefined) {
            filter = new PriceRangeFilter(filter, minPrice, maxPrice);
        }
        
        if (onlyWithDiscount && priceCalculatorFn) {
            filter = new DiscountFilter(filter, onlyWithDiscount, priceCalculatorFn);
        }
        
        return filter;
    }
}

// === APLICAÇÃO PRINCIPAL ===

class ProductApp {
    constructor() {
        this.products = [];
        this.activeDiscounts = [];
        this.currentSection = 'produtos';
        this.isEditing = false;
        this.editingProductName = null;
        
        // Sistema de filtros com padrão Decorator
        this.currentFilter = new BaseFilter();
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadCategoriesFromAPI(); // Carregar categorias primeiro
            await this.loadProductsFromAPI();
            this.updateDiscountFilterButton(); // Inicializar visibilidade do botão
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showToast('error', 'Erro', 'Erro ao carregar a aplicação');
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
        setupListener('btn-only-discounts', 'click', () => this.toggleDiscountFilter());

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

    async loadProductsFromAPI(filterParams = {}) {
        try {
            this.showLoading(true);
            
            // Construir URL com parâmetros de filtro
            const params = new URLSearchParams();
            if (filterParams.category) params.append('category', filterParams.category);
            if (filterParams.search) params.append('search', filterParams.search);
            if (filterParams.minPrice !== undefined) params.append('minPrice', filterParams.minPrice);
            if (filterParams.maxPrice !== undefined) params.append('maxPrice', filterParams.maxPrice);
            if (filterParams.inStockOnly) params.append('inStockOnly', 'true');
            
            // Usar URL de filtros apenas se houver parâmetros válidos
            const hasFilters = params.toString().length > 0;
            const url = hasFilters 
                ? `/api/products/filter?${params.toString()}`
                : '/api/products';
                
            console.log('🌐 URL da requisição:', url);
                
            const response = await fetch(url);
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
                
                // Exibir informações sobre filtros aplicados
                if (result.filter && result.filter !== 'Filtro base (sem filtragem)') {
                    this.showToast('success', 'Filtros aplicados', 
                        `${result.filtered} produtos encontrados. Filtro: ${result.filter}`);
                } else {
                    this.showToast('success', 'Produtos carregados', 
                        `${result.count || result.total || this.products.length} produtos encontrados`);
                }
                
                this.updateProductsList(); // Atualizar a lista na interface
                this.updateStatistics(); // Atualizar estatísticas
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
                await this.loadCategoriesFromAPI(); // Recarregar categorias (pode ter nova categoria)
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
        this.updateStatistics();
        this.updateDiscountInfo();
    }

    updateProductsList() {
        console.log('📋 Atualizando lista de produtos...');
        const container = document.getElementById('produtos-lista');
        const filteredProducts = this.getFilteredProducts();

        console.log('🛍️ Produtos para exibir:', filteredProducts.length);

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
                    ${discountPercentage > 0 ? `
                        <div class="discount-post-it">
                            <span class="discount-percentage">-${discountPercentage.toFixed(1)}%</span>
                        </div>
                    ` : ''}
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
                                    <div class="price-with-discount">
                                        <span class="original-price">De: R$ ${product.price.toFixed(2)}</span>
                                        <span class="final-price">Por: R$ ${finalPrice.toFixed(2)}</span>
                                        <span class="savings-amount">Economia: R$ ${discount.toFixed(2)}</span>
                                    </div>
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
        // As categorias agora são carregadas da API, não dos produtos filtrados
        this.loadCategoriesFromAPI();
    }

    async loadCategoriesFromAPI() {
        try {
            const response = await fetch('/api/categories');
            const result = await response.json();
            
            if (result.success) {
                const categoriaSelect = document.getElementById('filtro-categoria');
                const currentValue = categoriaSelect.value; // Preservar seleção atual
                
                categoriaSelect.innerHTML = '<option value="">Todas as categorias</option>' +
                    result.data.map(cat => 
                        `<option value="${cat}">${this.getCategoryDisplayName(cat)}</option>`
                    ).join('');
                
                // Restaurar seleção anterior se ainda existe
                if (currentValue && result.data.includes(currentValue)) {
                    categoriaSelect.value = currentValue;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            // Fallback para categorias dos produtos atuais
            this.updateFiltersFromCurrentProducts();
        }
    }

    updateFiltersFromCurrentProducts() {
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
        const totalDisplay = document.getElementById('total-discount-display');
        const totalValue = document.getElementById('total-discount-value');
        const savingsSection = document.getElementById('savings-section');
        
        if (!container) return;
        
        if (this.activeDiscounts.length === 0) {
            // Mostrar estado vazio
            container.innerHTML = `
                <div class="no-discounts-state">
                    <div class="empty-discount-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <h4>Nenhum desconto ativo</h4>
                    <p>Configure descontos acima para começar a economizar!</p>
                </div>
            `;
            
            // Manter badge total visível com 0%
            if (totalValue) {
                totalValue.textContent = '0%';
            }
            
            // Esconder apenas seção de economia
            if (savingsSection) savingsSection.style.display = 'none';
            return;
        }

        // Calcular total de desconto
        const totalDiscount = this.activeDiscounts.reduce((sum, discount) => sum + discount.percentage, 0);
        const limitedTotal = Math.min(totalDiscount, 100);

        // Criar cards de desconto
        let discountHtml = this.activeDiscounts.map(discount => {
            const typeLabels = {
                'Categoria': 'Categoria',
                'Cupom': 'Cupom',
                'category': 'Categoria',
                'bulk': 'Quantidade',
                'seasonal': 'Sazonal',
                'clearance': 'Liquidação',
                'vip': 'VIP'
            };
            
            const descriptions = {
                'Categoria': `Desconto aplicado em ${discount.category ? this.getCategoryDisplayName(discount.category) : 'categoria selecionada'}`,
                'Cupom': 'Cupom de desconto aplicado em todos os produtos',
                'category': `Desconto aplicado em ${discount.category || 'categoria selecionada'}`,
                'bulk': `Desconto para compras acima de ${discount.minQuantity || 1} unidades`,
                'seasonal': 'Desconto promocional por tempo limitado',
                'clearance': 'Desconto especial para liquidação de estoque',
                'vip': 'Desconto exclusivo para clientes VIP'
            };

            return `
                <div class="discount-card">
                    <div class="discount-info">
                        <div class="discount-type-badge" style="background: #007bff !important; color: white !important; padding: 0.3rem 0.8rem !important; border-radius: 20px !important; font-size: 0.8rem !important; font-weight: 600 !important; text-transform: uppercase !important; display: inline-block !important;">${typeLabels[discount.type] || discount.type}</div>
                        <div class="discount-details">
                            <div class="discount-title">
                                ${typeLabels[discount.type] || discount.type} 
                                ${discount.category ? `- ${this.getCategoryDisplayName(discount.category)}` : ''}
                            </div>
                            <p class="discount-description">
                                ${descriptions[discount.type] || 'Desconto ativo no momento'}
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span class="discount-value">${discount.percentage}%</span>
                        <button class="discount-remove" 
                                onclick="productApp.removeDiscount('${discount.id}')"
                                title="Remover desconto"
                                style="background: #e74c3c !important; color: white !important; border: none !important; border-radius: 50% !important; width: 32px !important; height: 32px !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; margin-left: 8px !important; font-size: 14px !important; font-weight: bold !important;">
                            ×
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = discountHtml;

        // Atualizar apenas o valor do total de desconto
        if (totalValue) {
            totalValue.textContent = `${limitedTotal}%`;
            
            // Adicionar aviso se desconto passou de 100%
            if (totalDiscount > 100) {
                totalValue.innerHTML = `${limitedTotal}% <small style="opacity: 0.8;">(máx.)</small>`;
            }
        }

        // Atualizar seção de economia
        this.updateSavingsSection();
    }

    updateSavingsSection() {
        const savingsSection = document.getElementById('savings-section');
        const affectedProductsCount = document.getElementById('affected-products-count');
        const totalSavingsAmount = document.getElementById('total-savings-amount');
        
        if (!savingsSection || this.activeDiscounts.length === 0) {
            if (savingsSection) savingsSection.style.display = 'none';
            return;
        }

        // Calcular produtos afetados e economia
        const affectedProducts = this.products.filter(p => this.calculateFinalPrice(p) < p.price);
        const totalSavings = this.products.reduce((sum, p) => sum + (p.price - this.calculateFinalPrice(p)), 0);

        // Atualizar valores
        if (affectedProductsCount) {
            affectedProductsCount.textContent = affectedProducts.length;
        }
        
        if (totalSavingsAmount) {
            totalSavingsAmount.textContent = `R$ ${totalSavings.toFixed(2)}`;
        }

        // Mostrar seção
        savingsSection.style.display = 'block';
    }

    getFilteredProducts() {
        // Os produtos já vêm filtrados do backend
        // Esta função agora apenas retorna os produtos carregados
        console.log('� Retornando produtos já filtrados do backend:', this.products.length);
        return [...this.products];
    }

    async applyFilters() {
        // Aplicar filtros através da API do backend
        const categoria = document.getElementById('filtro-categoria')?.value?.trim() || '';
        const busca = document.getElementById('filtro-busca')?.value?.trim() || '';
        
        const filterParams = {};
        
        // Só adicionar parâmetros se eles tiverem valor
        if (categoria) {
            filterParams.category = categoria;
        }
        if (busca) {
            filterParams.search = busca;
        }
        
        // Recarregar produtos com filtros aplicados
        await this.loadProductsFromAPI(filterParams);
        this.updateFilterFeedback(filterParams);
    }
    
    /**
     * Mostra feedback visual sobre filtros ativos (nova funcionalidade)
     */
    updateFilterFeedback(filterParams = {}) {
        // Se não foi fornecido parâmetros, pegar dos campos da interface
        if (Object.keys(filterParams).length === 0) {
            const categoria = document.getElementById('filtro-categoria')?.value || '';
            const busca = document.getElementById('filtro-busca')?.value || '';
            filterParams = {
                category: categoria || undefined,
                search: busca || undefined
            };
        }
        
        // Criar indicador de filtros ativos
        let filterStatus = '';
        const activeFilters = [];
        
        if (filterParams.category) {
            activeFilters.push(`Categoria: ${this.getCategoryDisplayName(filterParams.category)}`);
        }
        
        if (filterParams.search?.trim()) {
            activeFilters.push(`Busca: "${filterParams.search}"`);
        }
        
        if (filterParams.minPrice !== undefined || filterParams.maxPrice !== undefined) {
            let priceFilter = 'Preço: ';
            if (filterParams.minPrice !== undefined && filterParams.maxPrice !== undefined) {
                priceFilter += `R$ ${filterParams.minPrice.toFixed(2)} - R$ ${filterParams.maxPrice.toFixed(2)}`;
            } else if (filterParams.minPrice !== undefined) {
                priceFilter += `>= R$ ${filterParams.minPrice.toFixed(2)}`;
            } else {
                priceFilter += `<= R$ ${filterParams.maxPrice.toFixed(2)}`;
            }
            activeFilters.push(priceFilter);
        }
        
        if (filterParams.inStockOnly) {
            activeFilters.push('Apenas em estoque');
        }
        
        if (activeFilters.length > 0) {
            filterStatus = `🔍 Filtros ativos: ${activeFilters.join(' + ')}`;
        } else {
            filterStatus = '📋 Mostrando todos os produtos';
        }
        
        // Atualizar elementos de feedback se existirem
        const feedbackElement = document.getElementById('filter-feedback');
        if (feedbackElement) {
            feedbackElement.textContent = filterStatus;
            feedbackElement.className = activeFilters.length > 0 ? 'filter-active' : 'filter-inactive';
        }
        
        // Log detalhado para debugging
        console.log('🎯 Status do filtro:', filterStatus);
        console.log('📊 Produtos exibidos:', this.products.length);
    }
    
    /**
     * Limpa todos os filtros e mostra todos os produtos
     */
    async clearFilters() {
        console.log('🧹 Iniciando limpeza de filtros...');
        
        // Resetar campos de filtro
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('filtro-busca').value = '';
        
        console.log('🔄 Campos limpos, recarregando produtos...');
        
        // Recarregar todos os produtos sem filtros
        await this.loadProductsFromAPI();
        
        // Limpar feedback visual dos filtros
        this.updateFilterFeedback({});
        
        // Feedback para usuário
        this.showToast('info', 'Filtros limpos', 'Mostrando todos os produtos');
        console.log('✅ Filtros limpos com sucesso - Mostrando todos os produtos');
    }
    
    /**
     * Aplica filtro de desconto usando padrão Decorator
     */
    applyDiscountFilter(onlyWithDiscount = false) {
        const categoria = document.getElementById('filtro-categoria').value;
        const busca = document.getElementById('filtro-busca').value;
        
        // Criar filtro completo incluindo desconto
        this.currentFilter = FilterFactory.createCompleteFilter(
            categoria || null,
            busca || '',
            undefined, // minPrice
            undefined, // maxPrice
            onlyWithDiscount,
            onlyWithDiscount ? (product) => this.calculateFinalPrice(product) : null
        );
        
        console.log('💰 Filtro com desconto aplicado:', this.currentFilter.getDescription());
        this.updateProductsList();
        this.updateFilterFeedback();
    }
    
    /**
     * Toggle para filtro de produtos apenas com desconto
     */
    toggleDiscountFilter() {
        const btn = document.getElementById('btn-only-discounts');
        const isActive = btn.classList.contains('active');
        
        if (isActive) {
            // Remover filtro de desconto
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-percentage"></i> Apenas com desconto';
            this.applyDiscountFilter(false);
            this.showToast('info', 'Filtro removido', 'Mostrando todos os produtos');
        } else {
            // Aplicar filtro de desconto
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-check"></i> Com desconto ativo';
            this.applyDiscountFilter(true);
            this.showToast('success', 'Filtro aplicado', 'Mostrando apenas produtos com desconto');
        }
    }
    
    /**
     * Atualiza visibilidade do botão de filtro de desconto
     */
    updateDiscountFilterButton() {
        const btn = document.getElementById('btn-only-discounts');
        if (!btn) return;
        
        // Mostrar botão apenas se há descontos ativos
        if (this.activeDiscounts.length > 0) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-percentage"></i> Apenas com desconto';
        }
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
        this.updateDiscountFilterButton();
        
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
        this.updateDiscountFilterButton();
        
        // Limpar form
        document.getElementById('cupom-percentual').value = '';
    }

    removeDiscount(discountId) {
        this.activeDiscounts = this.activeDiscounts.filter(d => d.id !== discountId);
        this.showToast('success', 'Desconto removido', 'Desconto foi removido com sucesso');
        this.updateUI();
        this.updateDiscountFilterButton();
    }

    clearDiscounts() {
        if (this.activeDiscounts.length === 0) {
            this.showToast('info', 'Nenhum desconto', 'Não há descontos ativos para remover');
            return;
        }

        this.activeDiscounts = [];
        this.showToast('success', 'Descontos removidos', 'Todos os descontos foram removidos');
        this.updateUI();
        this.updateDiscountFilterButton();
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