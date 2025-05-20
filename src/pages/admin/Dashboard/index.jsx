import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Spin, DatePicker } from "antd";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import {
  getDailyRevenue,
  getTopSellingProducts,
  getTotalUserProductRevenue,
  totalOrderWithStatus,
} from "../../../services/statistic";
import { Table, Avatar } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
const { RangePicker } = DatePicker;
import moment from "moment";
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [orderStats, setOrderStats] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  // const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, "days"),
    moment(),
  ]);
  // Fetch data for dashboard
  const fetchDashboardData = async (startDate, endDate) => {
    setLoading(true);
    try {
      // Fetch revenue
      const revenueResponse = await getTotalUserProductRevenue(); // API doanh thu
      console.log("Response revenue data:", revenueResponse); // Log dữ liệu phản hồi
      setRevenue(revenueResponse.data.totalRevenue);
      setTotalProducts(revenueResponse.data.totalProducts);
      setTotalUsers(revenueResponse.data.totalUsers);

      // Fetch order statistics
      const orderStatsResponse = await totalOrderWithStatus(); // API thống kê đơn hàng
      console.log("Response order stats data:", orderStatsResponse.data); // Log dữ liệu phản hồi
      const stats = orderStatsResponse.data;
      setTotalOrders(stats.totalOrders);
      setOrderStats([
        { status: "PENDING", value: stats.pendingOrders },
        { status: "IN_PROGRESS", value: stats.inProgressOrders },
        { status: "SHIPPED", value: stats.shippedOrders },
        { status: "DELIVERED", value: stats.deliveredOrders },
        { status: "CANCELED", value: stats.canceledOrders },
      ]);

      // Fetch daily revenue
      const dailyRevenueRes = await getDailyRevenue(
        startDate.format("YYYY/MM/DD"),
        endDate.format("YYYY/MM/DD")
      ); // API doanh thu hàng ngày
      const dailyData = dailyRevenueRes.data.labels.map((date, idx) => ({
        date,
        revenue: dailyRevenueRes.data.data[idx],
      }));
      setDailyRevenue(dailyData);

      //
      // Fetch top selling products
      const topProductsRes = await getTopSellingProducts(
        startDate.format("YYYY/MM/DD"),
        endDate.format("YYYY/MM/DD"),
        5
      ); // API sản phẩm bán chạy
      setTopProducts(topProductsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  // const fetchMonthlyRevenue = async (start, end) => {
  //   const res = await getMonthlyRevenue(start, end);
  //   const chartData = res.labels.map((month, idx) => ({
  //     month,
  //     revenue: res.data[idx],
  //   }));
  //   setMonthlyRevenue(chartData);
  // };
  useEffect(() => {
    fetchDashboardData(dateRange[0], dateRange[1]);
  }, [dateRange]);
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };
  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4560"];
  const columnsTopProduct = [
    {
      title: "Ảnh",
      dataIndex: "productImage",
      key: "productImage",
      render: (img) => <Avatar shape="square" size={48} src={img} />,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Số lượng bán",
      dataIndex: "totalSold",
      key: "totalSold",
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (revenue) => `${revenue.toLocaleString()} VND`,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard Bán Hàng</h1>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={[16, 16]}>
          {/* Thống kê doanh thu */}
          <Col span={6}>
            <Card>
              <Statistic
                title="Khách hàng"
                value={totalUsers}
                precision={0}
                valueStyle={{ color: "#1890ff" }}
                prefix={<i className="fas fa-users"></i>}
              />
            </Card>
          </Col>

          {/* Tổng số đơn hàng */}
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng Số Sản Phẩm"
                value={totalProducts}
                precision={0}
                valueStyle={{ color: "#1890ff" }}
                prefix={<i className="fas fa-box"></i>}
              />
            </Card>
          </Col>
          {/* Tổng số đơn hàng */}
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng Số Đơn Hàng"
                value={totalOrders}
                precision={0}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          {/* Tổng số đơn hàng */}
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng Số doanh thu"
                value={revenue}
                precision={0}
                valueStyle={{ color: "#1890ff" }}
                prefix={<i className="fas fa-dollar-sign"></i>}
                suffix="VNĐ"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Biểu đồ doanh thu theo ngày">
              <div style={{ marginBottom: 24 }}>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateChange}
                  allowClear={false}
                  format="YYYY-MM-DD"
                  disabledDate={(current) =>
                    current && current > moment().endOf("day")
                  }
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={dailyRevenue}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1890ff"
                    name="Doanh thu"
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          {/* <Col span={12}>
            <Card title="Biểu đồ doanh thu theo ngày">
              <div style={{ marginBottom: 24 }}>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateChange}
                  allowClear={false}
                  format="YYYY-MM-DD"
                  disabledDate={(current) =>
                    current && current > moment().endOf("day")
                  }
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dailyRevenue}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#1890ff" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col> */}
          {/* Biểu đồ hình tròn */}
          <Col span={12}>
            <Card title="Thống kê đơn hàng theo tình trạng">
              <PieChart width={400} height={300}>
                <Pie
                  data={orderStats}
                  dataKey="value"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {orderStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Top sản phẩm bán chạy">
              <Table
                columns={columnsTopProduct}
                dataSource={topProducts}
                rowKey="productId"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
