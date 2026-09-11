import React from "react";
import { View, Text, StyleSheet } from "react-native";

const RedeemHistory = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View>
        <View style={[styles.card, styles.emptyContainer]}>
          <Text style={styles.emptyText}>No Recent Earnings 🪙</Text>
          <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 4, fontFamily: "Sora-Regular", textAlign: 'center' }}>
            Check back later after completing a job! ✨
          </Text>
        </View>
      </View>
    );
  }


  return (
    <View>
      {data.map((item, index) => {
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

        let status = item.status;
        let statusColor = item.statusColor;

        if (item.booking_id) { // Dynamic data
          if (item.status === '4') {
            status = 'Completed';
            statusColor = '#10b981'; // Green
          } else {
            status = 'Pending';
            statusColor = '#d97706'; // Orange
          }
        }

        return (
          <View style={[styles.card, { marginBottom: 12 }]} key={index}>
            <View style={styles.itemRow}>
              <View style={styles.infoCol}>
                <Text style={[styles.accText, { fontFamily: 'Sora-Bold' }]}>
                  {item.category_subchild_name || 'Earning'}
                </Text>
                <Text style={styles.subText}>
                  Txn ID: {id}
                </Text>
                <Text style={styles.subText}>
                  {displayDate}
                </Text>
              </View>

              <View style={styles.statusCol}>
                <View style={[styles.badge, { backgroundColor: statusColor }]}>
                  <Text style={styles.badgeText}>{status}</Text>
                </View>
                <Text style={[styles.amountText, { color: statusColor }]}>
                  ₹{item.total_amount || item.amount}
                </Text>
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
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoCol: { flex: 1, paddingRight: 10 },
  accText: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Sora-Regular',
    marginBottom: 2,
  },
  statusCol: { alignItems: 'flex-end', justifyContent: 'center' },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 60,
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Sora-SemiBold',
  },
  amountText: {
    fontSize: 16,
    fontFamily: 'Sora-Bold',
  },
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
