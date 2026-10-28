import { Suspense } from "react";
import { connection } from "next/server";
import { getCustomerOrders } from "@/lib/orders";

const statusLabels = {
  paid: "ชำระแล้ว",
  pending: "รอดำเนินการ",
  cancelled: "ยกเลิกแล้ว",
};

const currency = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export default function Home() {
  return (
    <Suspense fallback={<main className="dashboard-shell"><p className="loading-state">กำลังโหลดข้อมูลออร์เดอร์...</p></main>}>
      <OrdersDashboard />
    </Suspense>
  );
}

async function OrdersDashboard() {
  await connection();
  const rows = getCustomerOrders();
  const orders = rows.filter((row) => row.orderId !== null);
  const customerCount = new Set(rows.map((row) => row.customerId)).size;
  const totalAmount = orders.reduce((total, order) => total + order.amount, 0);

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="Orderly หน้าหลัก">
          <span className="brand-mark" aria-hidden="true">o</span>
          <span>orderly<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="live-indicator"><span />เชื่อมต่อฐานข้อมูลแล้ว</span>
          <span className="avatar" aria-label="ผู้ดูแลระบบ">A</span>
        </div>
      </header>

      <section className="dashboard-content" id="overview">
        <div className="page-heading">
          <div>
            <p className="eyebrow">ภาพรวมร้านค้า <span>·</span> กันยายน 2026</p>
            <h1>ออร์เดอร์ของลูกค้า</h1>
            <p className="page-description">ติดตามรายการสั่งซื้อและสถานะของลูกค้าทั้งหมดในที่เดียว</p>
          </div>
          <div className="updated-pill"><span className="refresh-icon">↻</span> ข้อมูลล่าสุด</div>
        </div>

        <div className="stats-grid" aria-label="สรุปข้อมูลออร์เดอร์">
          <article className="stat-card">
            <div className="stat-topline"><span>ลูกค้าทั้งหมด</span><span className="stat-icon customer-icon">♙</span></div>
            <p className="stat-value">{customerCount}<span className="stat-unit"> คน</span></p>
            <p className="stat-caption">รวมลูกค้าที่มีและไม่มีออร์เดอร์</p>
          </article>
          <article className="stat-card">
            <div className="stat-topline"><span>ออร์เดอร์ทั้งหมด</span><span className="stat-icon order-icon">▤</span></div>
            <p className="stat-value">{orders.length}<span className="stat-unit"> รายการ</span></p>
            <p className="stat-caption">รายการสั่งซื้อในระบบ</p>
          </article>
          <article className="stat-card revenue-card">
            <div className="stat-topline"><span>ยอดรวมออร์เดอร์</span><span className="stat-icon revenue-icon">฿</span></div>
            <p className="stat-value">{currency.format(totalAmount)}</p>
            <p className="stat-caption">คำนวณจากทุกรายการสั่งซื้อ</p>
          </article>
        </div>

        <section className="orders-panel" aria-labelledby="orders-heading">
          <div className="panel-heading">
            <div>
              <h2 id="orders-heading">รายการสั่งซื้อ</h2>
              <p>รายละเอียดออร์เดอร์แยกตามลูกค้า</p>
            </div>
            <span className="record-count">{orders.length} ออร์เดอร์</span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">ลูกค้า</th>
                  <th scope="col">เมือง</th>
                  <th scope="col">เลขออร์เดอร์</th>
                  <th scope="col">ยอดเงิน</th>
                  <th scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.customerId}-${row.orderId ?? "no-order"}`}>
                    <td>
                      <div className="customer-cell">
                        <span className={`customer-avatar avatar-${row.customerId}`}>
                          {row.customerName.slice(0, 1)}
                        </span>
                        <span className="customer-name">{row.customerName}</span>
                      </div>
                    </td>
                    <td className="city-cell">{row.city}</td>
                    <td>
                      {row.orderId ? (
                        <span className="order-number">#{row.orderId}</span>
                      ) : (
                        <span className="no-order">ยังไม่มีออร์เดอร์</span>
                      )}
                    </td>
                    <td className="amount-cell">{row.amount === null ? "—" : currency.format(row.amount)}</td>
                    <td>
                      {row.status ? (
                        <span className={`status-badge status-${row.status}`}>
                          <span className="status-dot" />{statusLabels[row.status] ?? row.status}
                        </span>
                      ) : (
                        <span className="status-empty">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel-footer">
            <span>แสดงลูกค้าทั้งหมด <strong>{customerCount}</strong> คน รวม <strong>{rows.length}</strong> แถว</span>
            <span className="sqlite-note"><span className="sqlite-dot" /> ข้อมูลจาก SQLite</span>
          </div>
        </section>
        <footer className="page-footer">ORDERLY <span>·</span> จัดการออร์เดอร์อย่างเป็นระบบ</footer>
      </section>
    </main>
  );
}
