const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');

function load(file, dependencies) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => {
    if (name in dependencies) return dependencies[name];
    throw new Error(`Unexpected import: ${name}`);
  }, console, Date });
  return exports;
}

const prices = load('lib/format-price.ts', {});
test('discount badge rounds the saving against MRP correctly', () => {
  const { dealDiscountPercent } = load('components/home/deal-price-display.tsx', {
    '@/lib/format-price': prices, 'react/jsx-runtime': {},
  });
  assert.equal(dealDiscountPercent('₹13,592', '₹29,999'), 55);
  assert.equal(dealDiscountPercent('₹13,592', '₹15,990'), 15);
  assert.equal(dealDiscountPercent('₹13,592', null), 0);
});
function editor(savedPrice, catalogPrice = '₹15,990') {
  const state = [];
  let cursor = 0;
  let sent;
  const jsx = (type, props) => ({ type, props });
  const dependencies = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: {
      useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = value; }]; },
      useRef: () => ({ current: null }), useEffect() {}, useMemo: fn => fn(),
    },
    'next/image': {}, 'next/link': {}, 'next/navigation': { useRouter: () => ({ refresh() {} }) },
    'lucide-react': {}, '@/components/ui/switch': {}, '@/lib/client/upload-product-image': {},
    '@/lib/format-price': prices,
    '@/components/home/deal-price-display': {},
  };
  const source = fs.readFileSync(path.join(__dirname, '../components/admin/deals/deal-of-the-day-editor.tsx'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => dependencies[name],
    fetch: async (_url, options) => { sent = JSON.parse(options.body); return { ok: true, json: async () => ({ data: sent }) }; },
  });
  const props = { deal: { productId: 'p1', title: 'Deal', description: 'Description', image: null,
    dealPrice: savedPrice, compareAtPrice: '₹15,990', features: [], unitsLeft: 16, totalUnits: 114,
    endsAt: '2027-01-01T00:00:00.000Z', isActive: true },
    products: [{ id: 'p1', name: 'Projector', price: catalogPrice, oldPrice: '₹29,999', image: '/image.png' }] };
  let tree;
  function render() { cursor = 0; tree = exports.DealOfTheDayEditor(props); }
  function find(predicate, node = tree) {
    if (!node || typeof node !== 'object') return;
    if (predicate(node)) return node;
    for (const child of [node.props?.children].flat(Infinity)) {
      if (!child || typeof child !== 'object') continue;
      const result = find(predicate, child); if (result) return result;
    }
  }
  render();
  return {
    changeTitle(value) { find(n => n.type === 'input' && n.props.placeholder === 'e.g. BLAZE B2000').props.onChange({ target: { value } }); render(); },
    changeDiscount(value) { find(n => n.type === 'input' && n.props.placeholder === 'e.g. 20').props.onChange({ target: { value } }); render(); },
    async save() { await find(n => n.type === 'form').props.onSubmit({ preventDefault() {} }); render(); return sent; },
  };
}

for (const savedPrice of ['₹8,475', '₹8,499.50']) {
  test(`unrelated edits preserve exact saved price ${savedPrice}`, async () => {
    const form = editor(savedPrice);
    form.changeTitle('Updated title');
    const payload = await form.save();
    assert.equal(prices.parsePriceNumber(payload.dealPrice), prices.parsePriceNumber(savedPrice));
    assert.equal(payload.compareAtPrice, '₹15,990');
    assert.equal('discountPercent' in payload, false);
    form.changeTitle('Another title');
    assert.equal((await form.save()).dealPrice, payload.dealPrice);
  });
}
test('catalog price changes do not silently reprice a saved deal', async () => {
  const form = editor('₹8,499', '₹17,990');
  form.changeTitle('Updated title');
  assert.equal((await form.save()).dealPrice, '₹8,499');
});
test('explicit percentage edit recalculates once, later saves preserve it', async () => {
  const form = editor('₹8,499');
  form.changeDiscount('20');
  const payload = await form.save();
  assert.equal(payload.dealPrice, '₹12,792');
  assert.equal(payload.discountPercent, 20);
  form.changeTitle('New title');
  assert.equal('discountPercent' in await form.save(), false);
});

test('server preserves exact submitted prices unless a discount is explicitly provided', async () => {
  const controller = load('lib/server/controllers/deal-of-the-day.controller.ts', {
    '@/lib/format-price': prices,
    '@/lib/server/dal/deal-of-the-day.dal': { saveDealOfTheDay: async data => data },
    '@/lib/server/controllers/products.controller': { getProduct: async (_id, pricing) => {
      assert.equal(pricing, 'catalog');
      return { id: 'p1', price: '₹15,990' };
    } },
  });
  const input = { productId: 'p1', title: 'Updated title', description: 'Description',
    dealPrice: '₹8,499.50', compareAtPrice: '₹15,990', unitsLeft: 16, totalUnits: 114, endsAt: '2027-01-01' };
  assert.equal((await controller.saveDealOfTheDay(input)).dealPrice, '₹8,499.50');
  assert.equal((await controller.saveDealOfTheDay({ ...input, discountPercent: 20 })).dealPrice, '₹12,792');
});
