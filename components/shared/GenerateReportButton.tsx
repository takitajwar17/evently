"use client";

import { IOrderItem } from "@/lib/database/models/order.model";
import { formatDateTime, formatPrice } from "@/lib/utils";
import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type GenerateReportButtonProps = {
  orders: IOrderItem[];
  event: any;
};

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
  },
});

// PDF Document component
const PDFReport = ({ orders, event }: GenerateReportButtonProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Event Report</Text>

        {/* Event Details */}
        <Text style={styles.title}>Event Details</Text>
        <Text style={styles.text}>Title: {event.title}</Text>
        <Text style={styles.text}>
          Date: {formatDateTime(event.startDateTime).dateTime}
        </Text>
        <Text style={styles.text}>Location: {event.location}</Text>
        <Text style={styles.text}>
          Organizer: {event.organizer.firstName} {event.organizer.lastName}
        </Text>

        {/* Orders/Attendees Table */}
        <Text style={styles.title}>Attendees List</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Order ID</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Buyer Name</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Amount</Text>
            </View>
          </View>

          {/* Table Rows */}
          {orders.map((order) => (
            <View style={styles.tableRow} key={order._id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{order._id}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{order.buyer}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {formatDateTime(order.createdAt).dateTime}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {formatPrice(order.totalAmount)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.text}>Total Orders: {orders.length}</Text>
          <Text style={styles.text}>
            Total Revenue:{" "}
            {formatPrice(
              orders.reduce((sum, order) => sum + order.totalAmount, 0)
            )}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

const GenerateReportButton = ({ orders, event }: GenerateReportButtonProps) => {
  return (
    <div className="flex justify-end">
      <PDFDownloadLink
        document={<PDFReport orders={orders} event={event} />}
        fileName={`${event.title}-report.pdf`}
        className="p-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md"
      >
        {({ blob, url, loading, error }) =>
          loading ? "Generating report..." : "Download PDF Report"
        }
      </PDFDownloadLink>
    </div>
  );
};

export default GenerateReportButton;
