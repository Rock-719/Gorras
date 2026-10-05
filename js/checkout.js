/* =====================================================================
   checkout.js — Finalizar compra (checkout.html)
   Validación de formulario, resumen del pedido, método de pago,
   simulación de pago y confirmación con número de pedido ficticio.
   ===================================================================== */

const LS_LAST_ORDER = 'capzone_ultimo_pedido';
const PAYMENT_LABELS = {
  tarjeta: 'Tarjeta de crédito / débito',
  pse: 'PSE',
  contraentrega: 'Contraentrega'
};

/* -------------------------------------------------------------------
   Resumen del pedido
   ------------------------------------------------------------------- */
function renderOrderSummary() {
  const container = document.getElementById('orderSummary');
  if (!container) return;

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = [
      '<div class="alert alert-warning mb-0">',
      '  <i class="bi bi-exclamation-triangle me-2"></i>Tu carrito está vacío.',
      '  <a href="' + catalogUrl() + '" class="alert-link d-block mt-1">Volver al catálogo</a>',
      '</div>'
    ].join('');
    const submit = document.getElementById('placeOrderBtn');
    if (submit) submit.disabled = true;
    return;
  }

  const totals = getCartTotals();

  const lines = cart
    .map((line) => {
      const product = getProductById(line.productId);
      if (!product) return '';
      return [
        '<div class="summary-line">',
        '  <div class="summary-line-img">',
        '    <img src="' + resolveImage(product.images[0]) + '" alt="' + escapeHTML(product.name) + '" loading="lazy" onerror="imgFallback(this)">',
        '    <span class="summary-qty">' + line.quantity + '</span>',
        '  </div>',
        '  <div class="summary-line-info">',
        '    <strong>' + escapeHTML(product.name) + '</strong>',
        '    <small>' + escapeHTML(line.color + ' · ' + line.size) + '</small>',
        '  </div>',
        '  <span class="summary-line-price">' + formatCOP(product.price * line.quantity) + '</span>',
        '</div>'
      ].join('');
    })
    .join('');

  container.innerHTML = [
    '<h2 class="h5 summary-title">Tu pedido</h2>',
    '<div class="summary-lines">' + lines + '</div>',
    '<dl class="summary-list mt-3">',
    '  <div><dt>Subtotal</dt><dd>' + formatCOP(totals.listSubtotal) + '</dd></div>',
    '  <div class="summary-discount"><dt>Descuento</dt><dd>-' + formatCOP(totals.discount) + '</dd></div>',
    '  <div><dt>Envío</dt><dd>' + (totals.shipping === 0 ? 'Gratis' : formatCOP(totals.shipping)) + '</dd></div>',
    '  <div class="summary-total"><dt>TOTAL</dt><dd>' + formatCOP(totals.total) + '</dd></div>',
    '</dl>',
    totals.remainingForFreeShipping > 0
      ? '<p class="small text-muted mb-0"><i class="bi bi-truck me-1"></i>Agrega ' + formatCOP(totals.remainingForFreeShipping) + ' más y el envío es gratis.</p>'
      : '<p class="small text-success mb-0"><i class="bi bi-truck"></i> ¡Tienes envío gratis!</p>'
  ].join('');
}

/* -------------------------------------------------------------------
   Método de pago
   ------------------------------------------------------------------- */
function initPaymentMethods() {
  const cardFields = document.getElementById('cardFields');
  const methods = document.querySelectorAll('input[name="paymentMethod"]');

  methods.forEach((method) => {
    method.addEventListener('change', () => {
      document.querySelectorAll('.payment-option').forEach((option) => {
        option.classList.toggle('is-selected', option.contains(method) || option.querySelector('input') === method);
      });
      if (cardFields) cardFields.classList.toggle('d-none', method.value !== 'tarjeta');
    });
  });
}

/* -------------------------------------------------------------------
   Validación
   ------------------------------------------------------------------- */
function validateCheckoutForm(form) {
  form.classList.add('was-validated');

  const phone = form.querySelector('#phone');
  if (phone && !/^[0-9+\s-]{7,15}$/.test(phone.value.trim())) {
    phone.setCustomValidity('invalid');
  } else if (phone) {
    phone.setCustomValidity('');
  }

  const cardNumber = form.querySelector('#cardNumber');
  const selectedMethod = form.querySelector('input[name="paymentMethod"]:checked');
  if (cardNumber && selectedMethod && selectedMethod.value === 'tarjeta') {
    const digits = cardNumber.value.replace(/\s/g, '');
    cardNumber.setCustomValidity(digits.length === 16 && /^[0-9]+$/.test(digits) ? '' : 'invalid');
  } else if (cardNumber) {
    cardNumber.setCustomValidity('');
  }

  const expiry = form.querySelector('#cardExpiry');
  if (expiry && selectedMethod && selectedMethod.value === 'tarjeta') {
    expiry.setCustomValidity(/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry.value.trim()) ? '' : 'invalid');
  } else if (expiry) {
    expiry.setCustomValidity('');
  }

  const cvv = form.querySelector('#cardCvv');
  if (cvv && selectedMethod && selectedMethod.value === 'tarjeta') {
    cvv.setCustomValidity(/^[0-9]{3,4}$/.test(cvv.value.trim()) ? '' : 'invalid');
  } else if (cvv) {
    cvv.setCustomValidity('');
  }

  return form.checkValidity();
}

/* -------------------------------------------------------------------
   Confirmación del pedido
   ------------------------------------------------------------------- */
function generateOrderNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  const stamp = String(Date.now()).slice(-4);
  return 'CAP-' + stamp + '-' + random;
}

function showOrderConfirmation(order) {
  let modalElement = document.getElementById('confirmationModal');
  if (!modalElement) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
      '<div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationTitle" aria-hidden="true" data-bs-backdrop="static">',
      '  <div class="modal-dialog modal-dialog-centered">',
      '    <div class="modal-content confirmation-modal">',
      '      <div class="modal-body text-center p-4 p-md-5">',
      '        <div class="confirmation-icon"><i class="bi bi-check-lg"></i></div>',
      '        <h2 class="h4 mt-3" id="confirmationTitle">¡Pedido realizado correctamente!</h2>',
      '        <p class="text-muted mb-1">Gracias por comprar en CAPZONE. Enviamos el detalle a</p>',
      '        <p class="fw-semibold mb-3" id="confirmEmail"></p>',
      '        <div class="order-number-box">',
      '          <span class="small text-muted d-block">Número de pedido</span>',
      '          <strong id="confirmOrderNumber"></strong>',
      '        </div>',
      '        <p class="small text-muted mt-3 mb-4">Este es un pago simulado: no se realizó ningún cobro real.</p>',
      '        <div class="d-grid gap-2">',
      '          <button type="button" class="btn btn-accent" id="btnContinueShopping">Seguir comprando</button>',
      '          <a class="btn btn-outline-dark" href="' + BASE_PATH + 'index.html">Volver al inicio</a>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(wrapper.firstElementChild);
    modalElement = document.getElementById('confirmationModal');
    document.getElementById('btnContinueShopping').addEventListener('click', () => {
      bootstrap.Modal.getOrCreateInstance(modalElement).hide();
      window.location.href = catalogUrl();
    });
  }

  document.getElementById('confirmOrderNumber').textContent = order.number;
  document.getElementById('confirmEmail').textContent = order.email;
  bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

/* -------------------------------------------------------------------
   Inicialización
   ------------------------------------------------------------------- */
function initCheckout() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  renderOrderSummary();
  initPaymentMethods();

  const customerName = form.querySelector('#firstName');

  form.addEventListener(
    'invalid',
    (event) => {
      event.target.classList.add('is-invalid');
    },
    true
  );

  const clearFieldError = (event) => {
    event.target.classList.remove('is-invalid');
    event.target.setCustomValidity('');
  };

  form.addEventListener('input', clearFieldError);
  form.addEventListener('change', clearFieldError);

  // Formateo de tarjeta (solo visual)
  const cardNumber = form.querySelector('#cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', () => {
      const digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
      cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!getCart().length) {
      showToast('Tu carrito está vacío', 'warning');
      return;
    }

    if (!validateCheckoutForm(form)) {
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('Revisa los campos marcados antes de continuar', 'danger');
      return;
    }

    const data = new FormData(form);
    const totals = getCartTotals();
    const order = {
      number: generateOrderNumber(),
      email: String(data.get('email') || ''),
      name: String(data.get('firstName') || '') + ' ' + String(data.get('lastName') || ''),
      city: String(data.get('city') || ''),
      payment: PAYMENT_LABELS[String(data.get('paymentMethod'))] || '—',
      total: totals.total,
      date: new Date().toLocaleString('es-CO')
    };

    storageSet(LS_LAST_ORDER, order);
    clearCart();
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('cardFields')?.classList.add('d-none');
    renderOrderSummary();
    showOrderConfirmation(order);

    if (customerName) customerName.blur();
  });
}

document.addEventListener('DOMContentLoaded', initCheckout);
