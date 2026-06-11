// ===== 通用註冊表 =====
// 所有遊戲物件（方塊、紋理、生成 pass…）都透過 Registry 註冊，
// 以顯式 id 保證存檔相容；用 extend() 客製既有定義、register() 新增。

export class Registry {
  constructor(kind) {
    this.kind = kind;
    this.byId = [];
    this.byName = new Map();
  }

  register(def) {
    if (def.id == null) throw new Error(`[${this.kind}] 缺少顯式 id：${def.name}`);
    if (this.byId[def.id]) throw new Error(`[${this.kind}] id 衝突：${def.id}（${def.name} vs ${this.byId[def.id].name}）`);
    if (this.byName.has(def.name)) throw new Error(`[${this.kind}] name 衝突：${def.name}`);
    this.byId[def.id] = def;
    this.byName.set(def.name, def);
    return def;
  }

  get(id) {
    return this.byId[id] || null;
  }

  getByName(name) {
    return this.byName.get(name) || null;
  }

  // 修改既有定義（例如 mod 想讓玻璃可被爆破）
  extend(name, patch) {
    const def = this.getByName(name);
    if (!def) throw new Error(`[${this.kind}] 找不到 ${name}`);
    return Object.assign(def, patch);
  }

  all() {
    return this.byId.filter(Boolean);
  }
}
