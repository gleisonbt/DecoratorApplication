/**
 * Sistema de Gerenciamento de Produtos - Interface Web
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

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.updateUI();
        this.showToast('success', 'Sistema iniciado', 'Bem-vindo ao Sistema de Gerenciamento de Produtos!');
    }

    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Botões principais
        document.getElementById('btn-adicionar').addEventListener('click', () => this.openProductModal());
        document.getElementById('btn-limpar-filtros').addEventListener('click', () => this.clearFilters());
        document.getElementById('btn-atualizar-stats').addEventListener('click', () => this.updateStatistics());

        // Filtros
        document.getElementById('filtro-categoria').addEventListener('change', () => this.applyFilters());
        document.getElementById('filtro-busca').addEventListener('input', () => this.applyFilters());

        // Modal
        document.getElementById('modal-fechar').addEventListener('click', () => this.closeModal());
        document.getElementById('btn-cancelar').addEventListener('click', () => this.closeModal());
        document.getElementById('form-produto').addEventListener('submit', (e) => this.handleProductSubmit(e));

        // Descontos
        document.getElementById('btn-aplicar-categoria').addEventListener('click', () => this.applyCategoryDiscount());
        document.getElementById('btn-aplicar-cupom').addEventListener('click', () => this.applyCouponDiscount());
        document.getElementById('btn-limpar-descontos').addEventListener('click', () => this.clearDiscounts());

        // Fechar modal ao clicar fora
        document.getElementById('modal-produto').addEventListener('click', (e) => {
            if (e.target.id === 'modal-produto') {
                this.closeModal();
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Heurística 1: Visibilidade do status do sistema
    showLoading(show = true) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    // Heurística 2: Correspondência entre sistema e mundo real
    loadSampleData() {
        const sampleProducts = [
            { name: 'iPhone 15 Pro', category: 'eletronicos', price: 7999.99 },
            { name: 'Samsung Galaxy S24', category: 'eletronicos', price: 4999.99 },
            { name: 'O Hobbit', category: 'livros', price: 35.90 },
            { name: 'Clean Code', category: 'livros', price: 89.99 },
            { name: 'Arroz Integral 1kg', category: 'alimentos', price: 8.50 },
            { name: 'Azeite Extra Virgem', category: 'alimentos', price: 25.90 }
        ];

        sampleProducts.forEach(product => {
            this.addProduct(product.name, product.category, product.price, false);
        });
    }

    // Heurística 3: Controle e liberdade do usuário
    switchSection(section) {
        // Atualiza navegação
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });

        // Atualiza seções
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.toggle('active', sec.id === section);
        });

        this.currentSection = section;
        
        if (section === 'estatisticas') {
            this.updateStatistics();
        }
        
        // Feedback visual
        this.showToast('info', 'Navegação', `Seção "${this.getSectionName(section)}" carregada`);
    }

    getSectionName(section) {
        const names = {
            'produtos': 'Produtos',
            'descontos': 'Descontos',
            'estatisticas': 'Estatísticas'
        };
        return names[section] || section;
    }

    // Heurística 4: Consistência e padrões
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatCategoryName(category) {
        const names = {
            'eletronicos': 'Eletrônicos',
            'livros': 'Livros',
            'alimentos': 'Alimentos'
        };
        return names[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            'eletronicos': 'fas fa-laptop',
            'livros': 'fas fa-book',
            'alimentos': 'fas fa-apple-alt'
        };
        return icons[category] || 'fas fa-box';
    }

    // Heurística 5: Prevenção de erros
    validateProduct(name, category, price) {
        const errors = {};

        if (!name || name.trim().length === 0) {
            errors.name = 'Nome é obrigatório';
        } else if (name.trim().length < 2) {
            errors.name = 'Nome deve ter pelo menos 2 caracteres';
        } else if (!this.isEditing && this.products.find(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
            errors.name = 'Produto com este nome já existe';
        }

        if (!category) {
            errors.category = 'Categoria é obrigatória';
        }

        if (!price || price <= 0) {
            errors.price = 'Preço deve ser maior que zero';
        } else if (price > 999999) {
            errors.price = 'Preço não pode exceder R$ 999.999,99';
        }

        return errors;
    }

    showValidationErrors(errors) {
        // Limpa erros anteriores
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.input').forEach(el => el.classList.remove('error'));

        // Mostra novos erros
        Object.entries(errors).forEach(([field, message]) => {
            const errorEl = document.getElementById(`erro-${field}`);
            const inputEl = document.getElementById(`produto-${field}`);
            
            if (errorEl) errorEl.textContent = message;
            if (inputEl) inputEl.classList.add('error');
        });
    }

    // Heurística 6: Reconhecimento ao invés de memorização
    openProductModal(product = null) {
        const modal = document.getElementById('modal-produto');
        const title = document.getElementById('modal-titulo');
        const form = document.getElementById('form-produto');

        // Limpa validações anteriores
        this.showValidationErrors({});

        if (product) {
            // Editando produto existente
            this.isEditing = true;
            this.editingProductName = product.name;
            title.textContent = 'Editar Produto';
            
            document.getElementById('produto-nome').value = product.name;
            document.getElementById('produto-categoria').value = product.category;
            document.getElementById('produto-preco').value = product.price;
            
            document.getElementById('btn-salvar').innerHTML = '<i class="fas fa-save"></i> Atualizar';
        } else {
            // Adicionando novo produto
            this.isEditing = false;
            this.editingProductName = null;
            title.textContent = 'Adicionar Produto';
            
            form.reset();
            document.getElementById('btn-salvar').innerHTML = '<i class="fas fa-save"></i> Salvar';
        }

        modal.classList.add('show');
        
        // Foco no primeiro campo
        setTimeout(() => {
            document.getElementById('produto-nome').focus();
        }, 100);
    }

    closeModal() {
        document.getElementById('modal-produto').classList.remove('show');
        this.isEditing = false;
        this.editingProductName = null;
    }

    // Heurística 7: Flexibilidade e eficiência de uso
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: Novo produto
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (this.currentSection === 'produtos') {
                this.openProductModal();
            }
        }

        // Escape: Fechar modal
        if (e.key === 'Escape') {
            this.closeModal();
        }

        // Ctrl/Cmd + F: Focar na busca
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (this.currentSection === 'produtos') {
                document.getElementById('filtro-busca').focus();
            }
        }
    }

    handleProductSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('produto-nome').value.trim();
        const category = document.getElementById('produto-categoria').value;
        const price = parseFloat(document.getElementById('produto-preco').value);

        const errors = this.validateProduct(name, category, price);
        
        if (Object.keys(errors).length > 0) {
            this.showValidationErrors(errors);
            this.showToast('error', 'Erro de validação', 'Corrija os campos destacados');
            return;
        }

        this.showLoading(true);

        // Simula operação assíncrona
        setTimeout(() => {
            try {
                if (this.isEditing) {
                    this.updateProduct(this.editingProductName, name, category, price);
                    this.showToast('success', 'Produto atualizado', `${name} foi atualizado com sucesso`);
                } else {
                    this.addProduct(name, category, price);
                    this.showToast('success', 'Produto adicionado', `${name} foi adicionado com sucesso`);
                }
                
                this.closeModal();
                this.updateUI();
            } catch (error) {
                this.showToast('error', 'Erro', error.message);
            } finally {
                this.showLoading(false);
            }
        }, 500);
    }

    addProduct(name, category, price, showFeedback = true) {
        if (this.products.find(p => p.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('Produto com este nome já existe');
        }

        this.products.push({
            name: name.trim(),
            category,
            price: parseFloat(price),
            id: Date.now() // ID simples baseado em timestamp
        });

        if (showFeedback) {
            this.updateUI();
        }
    }

    updateProduct(originalName, newName, category, price) {
        const productIndex = this.products.findIndex(p => p.name === originalName);
        
        if (productIndex === -1) {
            throw new Error('Produto não encontrado');
        }

        // Verifica se o novo nome já existe (exceto para o produto atual)
        if (newName !== originalName && 
            this.products.find(p => p.name.toLowerCase() === newName.toLowerCase())) {
            throw new Error('Produto com este nome já existe');
        }

        this.products[productIndex] = {
            ...this.products[productIndex],
            name: newName.trim(),
            category,
            price: parseFloat(price)
        };
    }

    removeProduct(name) {
        const index = this.products.findIndex(p => p.name === name);
        if (index !== -1) {
            const product = this.products[index];
            this.products.splice(index, 1);
            this.updateUI();
            this.showToast('success', 'Produto removido', `${product.name} foi removido`);
        }
    }

    // Heurística 8: Design estético e minimalista
    calculatePrice(product) {
        let price = product.price;
        let discount = 0;

        // Aplica descontos na ordem correta
        this.activeDiscounts.forEach(discountRule => {
            if (discountRule.type === 'category' && product.category === discountRule.category) {
                const discountAmount = price * discountRule.percent;
                price -= discountAmount;
                discount += discountAmount;
            } else if (discountRule.type === 'coupon') {
                const discountAmount = price * discountRule.percent;
                price -= discountAmount;
                discount += discountAmount;
            }
        });

        return {
            originalPrice: product.price,
            finalPrice: price,
            discount: discount,
            discountPercent: product.price > 0 ? (discount / product.price) * 100 : 0
        };
    }

    renderProduct(product) {
        const priceInfo = this.calculatePrice(product);
        const hasDiscount = priceInfo.discount > 0;

        return `
            <div class="product-card">
                ${hasDiscount ? `<div class="discount-badge">-${priceInfo.discountPercent.toFixed(0)}%</div>` : ''}
                <div class="product-header">
                    <span class="product-category">
                        <i class="${this.getCategoryIcon(product.category)}"></i>
                        ${this.formatCategoryName(product.category)}
                    </span>
                    <div class="product-actions">
                        <button class="btn btn-sm btn-secondary" onclick="app.openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})" title="Editar produto">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.confirmRemoveProduct('${product.name}')" title="Remover produto">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    ${hasDiscount ? `
                        <div class="price-discount">${this.formatCurrency(priceInfo.originalPrice)}</div>
                        <div class="price-final">${this.formatCurrency(priceInfo.finalPrice)}</div>
                        <small>Economia: ${this.formatCurrency(priceInfo.discount)}</small>
                    ` : `
                        <div class="price-original">${this.formatCurrency(priceInfo.originalPrice)}</div>
                    `}
                </div>
            </div>
        `;
    }

    confirmRemoveProduct(name) {
        if (confirm(`Tem certeza que deseja remover "${name}"?`)) {
            this.removeProduct(name);
        }
    }

    updateProductsList() {
        const container = document.getElementById('produtos-lista');
        const emptyState = document.getElementById('produtos-vazio');
        
        const filteredProducts = this.getFilteredProducts();
        
        if (filteredProducts.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            container.innerHTML = filteredProducts.map(product => this.renderProduct(product)).join('');
        }
    }

    getFilteredProducts() {
        const categoryFilter = document.getElementById('filtro-categoria').value;
        const searchFilter = document.getElementById('filtro-busca').value.toLowerCase();

        return this.products.filter(product => {
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            const matchesSearch = !searchFilter || product.name.toLowerCase().includes(searchFilter);
            return matchesCategory && matchesSearch;
        });
    }

    applyFilters() {
        this.updateProductsList();
        
        // Feedback para o usuário
        const filtered = this.getFilteredProducts();
        const total = this.products.length;
        
        if (filtered.length !== total) {
            this.showToast('info', 'Filtros aplicados', `Mostrando ${filtered.length} de ${total} produtos`);
        }
    }

    clearFilters() {
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('filtro-busca').value = '';
        this.updateProductsList();
        this.showToast('info', 'Filtros limpos', 'Todos os produtos estão sendo exibidos');
    }

    // Sistema de descontos
    applyCategoryDiscount() {
        const category = document.getElementById('desconto-categoria').value;
        const percent = parseFloat(document.getElementById('desconto-percentual').value) / 100;

        if (!percent || percent <= 0 || percent > 1) {
            this.showToast('error', 'Erro', 'Digite um percentual válido entre 1 e 100');
            return;
        }

        // Remove desconto anterior da mesma categoria
        this.activeDiscounts = this.activeDiscounts.filter(d => 
            !(d.type === 'category' && d.category === category)
        );

        // Adiciona novo desconto
        this.activeDiscounts.push({
            type: 'category',
            category: category,
            percent: percent,
            description: `${(percent * 100).toFixed(0)}% de desconto em ${this.formatCategoryName(category)}`
        });

        this.updateDiscountStatus();
        this.updateProductsList();
        
        // Limpa o formulário
        document.getElementById('desconto-percentual').value = '';
        
        this.showToast('success', 'Desconto aplicado', 
            `${(percent * 100).toFixed(0)}% de desconto aplicado em ${this.formatCategoryName(category)}`);
    }

    applyCouponDiscount() {
        const percent = parseFloat(document.getElementById('cupom-percentual').value) / 100;

        if (!percent || percent <= 0 || percent > 1) {
            this.showToast('error', 'Erro', 'Digite um percentual válido entre 1 e 100');
            return;
        }

        // Remove cupom anterior
        this.activeDiscounts = this.activeDiscounts.filter(d => d.type !== 'coupon');

        // Adiciona novo cupom
        this.activeDiscounts.push({
            type: 'coupon',
            percent: percent,
            description: `Cupom de ${(percent * 100).toFixed(0)}% para todos os produtos`
        });

        this.updateDiscountStatus();
        this.updateProductsList();
        
        // Limpa o formulário
        document.getElementById('cupom-percentual').value = '';
        
        this.showToast('success', 'Cupom aplicado', 
            `Cupom de ${(percent * 100).toFixed(0)}% aplicado a todos os produtos`);
    }

    clearDiscounts() {
        if (this.activeDiscounts.length === 0) {
            this.showToast('info', 'Nenhum desconto', 'Não há descontos ativos para remover');
            return;
        }

        this.activeDiscounts = [];
        this.updateDiscountStatus();
        this.updateProductsList();
        this.showToast('success', 'Descontos removidos', 'Todos os descontos foram removidos');
    }

    updateDiscountStatus() {
        const container = document.getElementById('descontos-ativos');
        
        if (this.activeDiscounts.length === 0) {
            container.innerHTML = `
                <div class="no-discounts">
                    <i class="fas fa-info-circle"></i>
                    Nenhum desconto ativo no momento
                </div>
            `;
        } else {
            container.innerHTML = this.activeDiscounts.map(discount => `
                <div class="discount-item">
                    <span>
                        <i class="fas fa-tag"></i>
                        ${discount.description}
                    </span>
                    <button class="btn btn-sm btn-danger" onclick="app.removeDiscount('${discount.type}', '${discount.category || ''}')" title="Remover desconto">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    removeDiscount(type, category) {
        this.activeDiscounts = this.activeDiscounts.filter(d => 
            !(d.type === type && (type !== 'category' || d.category === category))
        );
        
        this.updateDiscountStatus();
        this.updateProductsList();
        this.showToast('success', 'Desconto removido', 'Desconto foi removido com sucesso');
    }

    // Estatísticas
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-preco-medio').textContent = this.formatCurrency(stats.averagePrice);
        document.getElementById('stat-mais-caro').textContent = stats.mostExpensive || '-';
        document.getElementById('stat-mais-barato').textContent = stats.cheapest || '-';
        
        this.updateCategoryChart(stats.byCategory);
    }

    calculateStatistics() {
        if (this.products.length === 0) {
            return {
                total: 0,
                averagePrice: 0,
                mostExpensive: null,
                cheapest: null,
                byCategory: {}
            };
        }

        const prices = this.products.map(p => p.price);
        const sorted = [...this.products].sort((a, b) => a.price - b.price);
        
        const byCategory = this.products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {});

        return {
            total: this.products.length,
            averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
            mostExpensive: sorted[sorted.length - 1]?.name,
            cheapest: sorted[0]?.name,
            byCategory
        };
    }

    updateCategoryChart(byCategory) {
        const container = document.getElementById('chart-categorias');
        const maxCount = Math.max(...Object.values(byCategory), 1);
        
        const categories = ['eletronicos', 'livros', 'alimentos'];
        
        container.innerHTML = categories.map(category => {
            const count = byCategory[category] || 0;
            const percentage = (count / maxCount) * 100;
            
            return `
                <div class="chart-item">
                    <div class="chart-label">${this.formatCategoryName(category)}</div>
                    <div class="chart-bar">
                        <div class="chart-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="chart-value">${count}</div>
                </div>
            `;
        }).join('');
    }

    // Heurística 9: Ajuda usuários a reconhecer, diagnosticar e recuperar de erros
    showToast(type, title, message, duration = 4000) {
        const container = document.getElementById('toast-container');
        const toastId = `toast-${Date.now()}`;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="app.closeToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Anima a entrada
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove automaticamente
        setTimeout(() => this.closeToast(toastId), duration);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'fa-check',
            'error': 'fa-exclamation-triangle',
            'warning': 'fa-exclamation',
            'info': 'fa-info'
        };
        return icons[type] || 'fa-info';
    }

    closeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }

    // Heurística 10: Ajuda e documentação
    updateUI() {
        this.updateProductsList();
        this.updateDiscountStatus();
        this.updateStatistics();
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProductApp();
});

// Previne perda de dados
window.addEventListener('beforeunload', (e) => {
    if (document.querySelector('.modal.show')) {
        e.preventDefault();
        e.returnValue = '';
    }
});