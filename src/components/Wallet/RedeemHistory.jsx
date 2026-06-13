import React from "react";
import { View, Text, StyleSheet } from "react-native";

const transactions = [
  {
    id: "123456AA87",
    date: "08 July, 2024",
    amount: "₹1,455",
    status: "Pending",
    statusColor: "#d97706",
  },
  {
    id: "123456AA87",
    date: "08 July, 2024",
    amount: "₹1,455",
    status: "Failed",
    statusColor: "#f87171",
  },
  {
    id: "123456AA87",
    date: "08 July, 2024",
    amount: "₹1,455",
    status: "Successful",
    statusColor: "#4d7c0f",
  },
];

const RedeemHistory = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.historyContainer, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No recent recharge history found.</Text>
      </View>
    );
  }


  return (
    <View style={styles.historyContainer}>
      {data.map((item, index) => {
        // If data comes from database, use those fields. Otherwise use dummy fields.
        const id = item.booking_id || item.id;
        
        let displayDate = item.date || "";
        if (item.booking_date) {
          const dateObj = new Date(item.booking_date);
          if (!isNaN(dateObj.getTime())) {
            const dateStr = dateObj.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
            
            let timeStr = "";
            if (item.booking_time) {
              const [hour, minute] = item.booking_time.split(":");
              let h = parseInt(hour, 10);
              const ampm = h >= 12 ? "PM" : "AM";
              h = h % 12 || 12;
              timeStr = ` • ${h}:${minute} ${ampm}`;
            }
            displayDate = `${dateStr}${timeStr}`;
          } else {
            displayDate = `${item.booking_date} ${item.booking_time || ""}`;
          }
        }

        const amount = item.total_amount ? `+ ₹${item.total_amount}` : `+ ${item.amount}`;
        
        let status = item.status;
        let statusColor = item.statusColor;

        if (item.booking_id) { // Dynamic data
           if(item.status === '4') {
             status = 'Completed';
             statusColor = '#10b981'; // Green
           } else {
             status = 'Pending';
             statusColor = '#d97706'; // Orange
           }
        }

        return (
          <View
            key={index}
            style={[
              styles.item,
              index === data.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.row}>
              <View>
                <Text style={styles.date}>{displayDate}</Text>
                <Text style={styles.transId}>Transaction ID: {id}</Text>
                <Text style={styles.amount}>{amount}</Text>
              </View>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <Text style={styles.statusText}>{status}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default RedeemHistory;

const styles = StyleSheet.create({
  historyContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 15,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  date: { fontSize: 12, fontWeight: "bold", color: "#3f3f46", marginBottom: 4 },
  transId: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  amount: { fontSize: 14, fontWeight: "bold", color: "#10b981" },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  statusText: { color: "white", fontSize: 11, fontWeight: "500" },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    fontFamily: "Sora-SemiBold",
  }
});
