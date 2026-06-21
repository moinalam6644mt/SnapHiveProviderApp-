import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Phone, Mail, Globe, Calendar, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ICard = ({ bookingDetails, providerDetails }) => {
  console.log('Provider Details in ICard:', providerDetails);
  const formatDate = dateString => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Fallback if invalid

      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };
  return (
    <View style={styles.cardContainer}>
      {/* TOP SECTION - Profile (White) */}
      <View style={styles.topSection}>
        <View style={styles.profileCircle}>
          <Image
            source={
              providerDetails?.logo
                ? { uri: providerDetails.logo }
                : {
                  uri: 'https://static.vecteezy.com/system/resources/thumbnails/048/334/475/small/a-person-icon-on-a-transparent-background-png.png',
                }
            }
            style={styles.avatar}
          />
        </View>

        <Text style={styles.userName}>{providerDetails?.name || 'Worker'}</Text>
        <Text style={styles.subText}>
          {providerDetails?.designation || 'N/A'}
        </Text>

        <View style={styles.orangeDivider} />

        <Text style={styles.idText}>
          ID: {providerDetails?.employee_id || 'N/A'}
        </Text>

        <View style={styles.brandContainer}>
          <Image
            source={require('../../../../assets/app/splashLogo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.poweredBySmall}>Powered by People</Text>
        </View>
      </View>

      {/* BOTTOM SECTION - Details (Dark Blue) */}
      <View style={styles.bottomSection}>
        {/* Header Logo Row */}
        <View style={styles.headerRow}>
          <View style={styles.miniLogoCircle}>
            {/* <Text style={styles.miniLogoText}>M</Text> */}
            <Image
              source={{
                uri: 'https://maidfort.com/assets/default/images/default/thumb/default-organization-logo.png',
              }}
              style={styles.customMiniLogoImage}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.companyTitle}>Maidfort</Text>
            <Text style={styles.companySub}>Power By People</Text>
          </View>
        </View>

        <View style={styles.separatorLine} />

        {/* CONTACT Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>CONTACT</Text>
          <View style={styles.infoRow}>
            <Phone size={12} color="#F26522" />
            <Text style={styles.detailText}>+91 79033 71185</Text>
          </View>
          <View style={styles.infoRow}>
            <Mail size={12} color="#F26522" />
            <Text style={styles.detailText}>maidfortkolkata@gmail.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Globe size={12} color="#F26522" />
            <Text style={styles.detailText}>www.maidfort.com</Text>
          </View>
        </View>

        {/* VALIDITY Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>VALIDITY</Text>
          <View style={styles.infoRow}>
            <Calendar size={12} color="#F26522" />
            <Text style={styles.detailText}>
              Valid: {formatDate(providerDetails?.joining_date)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={12} color="#F26522" />
            <Text style={styles.detailText}>
              Expiry: {formatDate(providerDetails?.expiry_date)}
            </Text>
          </View>
        </View>

        {/* ADDRESS Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>ADDRESS</Text>
          <View style={styles.infoRow}>
            <MapPin size={12} color="#F26522" />
            <Text style={styles.detailText}>
              48/93/115, KRISHNA NAGAR, KOLKATA-104
            </Text>
          </View>
        </View>

        <Text style={styles.copyright}>
          © 2026 maidfort. All Rights Reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: width * 0.87,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    marginVertical: 10,
  },
  topSection: {
    paddingVertical: 15, // Height komano hoyeche
    alignItems: 'center',
  },
  profileCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 3,
    borderColor: '#F26522',
    padding: 2,
    marginBottom: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F26522',
  },
  subText: {
    fontSize: 13,
    color: '#666',
  },
  orangeDivider: {
    width: 35,
    height: 2,
    backgroundColor: '#F26522',
    marginVertical: 5,
  },
  idText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  brandLogo: {
    width: 100,
    height: 25,
  },
  poweredBySmall: {
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
  },
  bottomSection: {
    backgroundColor: '#1A2634',
    padding: 15,
    borderTopWidth: 4,
    borderTopColor: '#F26522',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLogoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F26522',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  miniLogoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  companyTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  companySub: {
    color: '#BDC3C7',
    fontSize: 9,
  },
  separatorLine: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionHeading: {
    color: '#F26522',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 6,
  },
  copyright: {
    color: '#7F8C8D',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 5,
  },
  customMiniLogoImage: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
});

export default ICard;
