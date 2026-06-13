import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
// Lucide Icons Import
import {
  Clock,
  Wallet,
  Info,
  Zap,
  Moon,
  Repeat,
  AlertCircle,
} from 'lucide-react-native';

const CompleteDetailes = ({
  bookingDetails,
  providerDetails,
  elapsedSeconds,
  calculation, // Backend calculation data
}) => {
  if (!calculation) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Payment Details</Text>
        <View style={[styles.card, {alignItems: 'center', padding: 20}]}>
          <Text style={{color: '#71717A'}}>Calculating billing details...</Text>
        </View>
      </View>
    );
  }
  // Format price to show .00 only if needed
  const formatCurrency = value => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  // Static Data (Jodi calculation props na thake, tobei eigulo kaj korbe)
  const data = calculation;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>

      <View style={styles.card}>
        {/* 1. First Hour Charge */}
        <View style={styles.row}>
          <View style={styles.left}>
            <Zap size={18} color="#6366F1" strokeWidth={2} />
            <Text style={styles.label}>First Hour Charge</Text>
          </View>
          <Text style={styles.value}>₹{data.first_hour_charge}</Text>
        </View>

        {/* 2. Next Hours Charge */}
        {parseFloat(calculation?.next_hours_charge) > 0 && (
          <>
            <View style={styles.line} />
            <View style={styles.row}>
              <View style={styles.left}>
                <Wallet size={18} color="#6366F1" strokeWidth={1.8} />
                <Text style={styles.label}>Next Hours Charge</Text>
              </View>
              <Text style={styles.value}>₹{data.next_hours_charge}</Text>
            </View>
          </>
        )}

        {/* 3. Overtime Charge */}
        {parseFloat(data.overtime_charge) > 0 && (
          <>
            <View style={styles.line} />
            <View style={styles.row}>
              <View style={styles.left}>
                <Clock size={18} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.label}>Overtime Charges</Text>
              </View>
              <Text style={[styles.value, {color: '#F59E0B'}]}>
                ₹{data.overtime_charge}
              </Text>
            </View>
          </>
        )}

        {/* 4. Late Night Charge */}
        {parseFloat(data.late_night_charge) > 0 && (
          <>
            <View style={styles.row}>
              <View style={styles.left}>
                <Moon size={18} color="#6366F1" strokeWidth={2} />
                <Text style={styles.label}>Late Night Charge</Text>
              </View>
              <Text style={styles.value}>₹{data.late_night_charge}</Text>
            </View>
          </>
        )}

        {/* 5. Previous Cancellation Charge */}
        {parseFloat(data.cancel_charge) > 0 && (
          <>
            <View style={styles.row}>
              <View style={styles.left}>
                <AlertCircle size={18} color="#EF4444" strokeWidth={2} />
                <Text style={styles.label}>Previous Cancellation</Text>
              </View>
              <Text style={[styles.value, {color: '#EF4444'}]}>
                ₹{data.cancel_charge}
              </Text>
            </View>
          </>
        )}

        {/* Platform Fee & Tax */}
        {/* Platform Fee Row */}
        <View style={styles.line} />

        {/* Tax Amount Row */}
        <View style={styles.row}>
          <View style={styles.left}>
            <Info size={18} color="#71717A" strokeWidth={2} />
            <Text style={styles.label}>Tax Amount</Text>
          </View>
          <Text style={styles.value}>₹{data.tax_amount}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.left}>
            <Wallet size={18} color="#71717A" strokeWidth={2} />
            <Text style={styles.label}>Platform Fee</Text>
          </View>
          <Text style={styles.value}>₹{data.platform_fee}</Text>
        </View>

        <View
          style={[
            styles.line,
            {backgroundColor: '#E4E4E7', height: 1.5, marginVertical: 12},
          ]}
        />

        {/* Total Amount */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalValue}>₹{data.total}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Info size={16} color="#71717A" strokeWidth={2} />
        <Text style={styles.footerText}>
          Final billing is generated based on actual duration and applicable
          policy charges.
        </Text>
      </View>
    </View>
  );
};

export default CompleteDetailes;

// Styles same thakche...
const styles = StyleSheet.create({
  container: {marginHorizontal: 20, marginTop: 15},
  title: {fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 12},
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  left: {flexDirection: 'row', alignItems: 'center', gap: 10},
  label: {fontSize: 14, color: '#52525B', fontWeight: '500'},
  value: {fontSize: 15, fontWeight: '700', color: '#312E81'},
  line: {height: 1, backgroundColor: '#F1F5F9', marginVertical: 6},
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  footerText: {flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 16},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {fontSize: 16, fontWeight: '700', color: '#18181B'},
  totalValue: {fontSize: 22, fontWeight: '900', color: '#16A34A'},
});
