import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Modal,
  Animated,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useState, useRef, useEffect } from 'react';
import Svg, { Circle, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Mock data
const MOCK_USER_NAME = 'Henry';
const MOCK_CALORIES = {
  target: 2000,
  consumed: 1247,
  remaining: 753,
};

const MOCK_MACROS = {
  protein: { current: 65, target: 150, color: '#3b82f6' },
  carbs: { current: 180, target: 250, color: '#f97316' },
  fat: { current: 45, target: 67, color: '#a855f7' },
};

const MOCK_FOODS = [
  {
    id: '1',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    time: '12:30 PM',
  },
  {
    id: '2',
    name: 'Brown Rice',
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.6,
    time: '12:35 PM',
  },
  {
    id: '3',
    name: 'Oatmeal with Banana',
    calories: 210,
    protein: 7,
    carbs: 38,
    fat: 4,
    time: '8:15 AM',
  },
];

// Circular Progress Component
interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 100
  consumed: number;
  target: number;
}

const CircularProgress = ({ size, strokeWidth, progress, consumed, target }: CircularProgressProps) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    const listener = animatedProgress.addListener(({ value }) => {
      setDisplayProgress(value);
    });

    return () => animatedProgress.removeListener(listener);
  }, [progress]);

  const strokeDashoffset = circumference - (circumference * displayProgress) / 100;
  const angle = (displayProgress / 100) * 270; // 270 degrees for 3/4 circle

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '135deg' }] }}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#60a5fa"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center Content */}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, fontWeight: '800', color: '#FFFFFF' }}>
          {target - consumed}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', marginTop: 4 }}>
          calories left
        </Text>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current date
  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Calculate calorie progress percentage
  const calorieProgress = (MOCK_CALORIES.consumed / MOCK_CALORIES.target) * 100;
  
  // Determine calorie status color
  const getCalorieColor = () => {
    if (calorieProgress < 80) return '#3ecf8e';
    if (calorieProgress <= 100) return '#f59e0b';
    return '#ef4444';
  };

  // Calculate macro percentage
  const getMacroPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  // Toggle action menu with animation
  const toggleActionMenu = () => {
    if (showActionMenu) {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start(() => setShowActionMenu(false));
    } else {
      setShowActionMenu(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* Dark Navy + Deep Purple Gradient Background */}
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo and Branding */}
        <View style={styles.header}>
          <View style={styles.brandingSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🥗</Text>
            </View>
            <View style={styles.brandText}>
              <Text style={styles.appTitle}>NutriSnap</Text>
              <Text style={styles.appTagline}>Smart Nutrition Tracking</Text>
            </View>
          </View>
          <BlurView intensity={30} tint="light" style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>5</Text>
          </BlurView>
        </View>

        {/* Greeting Card - iOS Glassmorphism */}
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <Text style={styles.greeting}>
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || MOCK_USER_NAME}
          </Text>
          <Text style={styles.date}>{getCurrentDate()}</Text>
        </BlurView>

        {/* Daily Calorie Progress - iOS Glass Card with Circular Arc */}
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.calorieHeader}>
            <Text style={styles.calorieLabel}>Daily Goal</Text>
            <BlurView intensity={30} tint="light" style={styles.percentageBadge}>
              <Text style={styles.percentageText}>{Math.round(calorieProgress)}%</Text>
            </BlurView>
          </View>
          
          {/* Circular Progress Arc */}
          <View style={styles.calorieCircleContainer}>
            <CircularProgress 
              size={200}
              strokeWidth={12}
              progress={calorieProgress}
              consumed={MOCK_CALORIES.consumed}
              target={MOCK_CALORIES.target}
            />
          </View>

          <View style={styles.calorieStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{MOCK_CALORIES.consumed}</Text>
              <Text style={styles.statLabel}>Eaten</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{MOCK_CALORIES.target}</Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
          </View>
        </BlurView>

        {/* Macro Breakdown - iOS Glass Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macros</Text>
          <View style={styles.macrosGrid}>
            {/* Protein */}
            <BlurView intensity={25} tint="light" style={styles.macroCard}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValueLarge}>{MOCK_MACROS.protein.current}g</Text>
              <Text style={styles.macroTarget}>of {MOCK_MACROS.protein.target}g</Text>
              <View style={styles.macroBarBackground}>
                <View 
                  style={[
                    styles.macroBarFill, 
                    { 
                      width: `${getMacroPercentage(MOCK_MACROS.protein.current, MOCK_MACROS.protein.target)}%`,
                      backgroundColor: '#007AFF'
                    }
                  ]} 
                />
              </View>
            </BlurView>

            {/* Carbs */}
            <BlurView intensity={25} tint="light" style={styles.macroCard}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValueLarge}>{MOCK_MACROS.carbs.current}g</Text>
              <Text style={styles.macroTarget}>of {MOCK_MACROS.carbs.target}g</Text>
              <View style={styles.macroBarBackground}>
                <View 
                  style={[
                    styles.macroBarFill, 
                    { 
                      width: `${getMacroPercentage(MOCK_MACROS.carbs.current, MOCK_MACROS.carbs.target)}%`,
                      backgroundColor: '#FF9500'
                    }
                  ]} 
                />
              </View>
            </BlurView>

            {/* Fat */}
            <BlurView intensity={25} tint="light" style={styles.macroCard}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValueLarge}>{MOCK_MACROS.fat.current}g</Text>
              <Text style={styles.macroTarget}>of {MOCK_MACROS.fat.target}g</Text>
              <View style={styles.macroBarBackground}>
                <View 
                  style={[
                    styles.macroBarFill, 
                    { 
                      width: `${getMacroPercentage(MOCK_MACROS.fat.current, MOCK_MACROS.fat.target)}%`,
                      backgroundColor: '#AF52DE'
                    }
                  ]} 
                />
              </View>
            </BlurView>
          </View>
        </View>



        {/* Today's Food Log - iOS Glass Style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <Text style={styles.mealCount}>Logged {MOCK_FOODS.length} meals</Text>
          </View>
          <View style={styles.foodList}>
            {MOCK_FOODS.map((food) => (
              <TouchableOpacity 
                key={food.id}
                activeOpacity={0.8}
                onPress={() => Alert.alert(
                  food.name,
                  `Calories: ${food.calories}\nProtein: ${food.protein}g\nCarbs: ${food.carbs}g\nFat: ${food.fat}g\nTime: ${food.time}`
                )}
              >
                <BlurView intensity={25} tint="light" style={styles.foodCard}>
                  <View style={styles.foodMain}>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodTime}>{food.time}</Text>
                    </View>
                    <View style={styles.foodCalories}>
                      <Text style={styles.foodCaloriesValue}>{food.calories}</Text>
                      <Text style={styles.foodCaloriesLabel}>cal</Text>
                    </View>
                  </View>
                  <View style={styles.foodMacros}>
                    <View style={styles.foodMacroItem}>
                      <Text style={styles.foodMacroValue}>{food.protein}g</Text>
                      <Text style={styles.foodMacroLabel}>Protein</Text>
                    </View>
                    <View style={styles.foodMacroItem}>
                      <Text style={styles.foodMacroValue}>{food.carbs}g</Text>
                      <Text style={styles.foodMacroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.foodMacroItem}>
                      <Text style={styles.foodMacroValue}>{food.fat}g</Text>
                      <Text style={styles.foodMacroLabel}>Fat</Text>
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button - iOS Glass Style */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={toggleActionMenu}
        activeOpacity={0.8}
      >
        <BlurView intensity={30} tint="light" style={styles.fabGradient}>
          <LinearGradient
            colors={['rgba(96, 165, 250, 0.9)', 'rgba(59, 130, 246, 0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabInner}
          >
            <Text style={styles.fabIcon}>{showActionMenu ? '×' : '+'}</Text>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>

      {/* Action Menu Modal - iOS Glass */}
      <Modal
        visible={showActionMenu}
        transparent
        animationType="none"
        onRequestClose={toggleActionMenu}
      >
        <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
          <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={toggleActionMenu}>
            <Animated.View 
              style={[
                styles.actionMenuContainer,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: scaleAnim,
                }
              ]}
            >
              <BlurView intensity={35} tint="light" style={styles.actionMenu}>
                <Text style={styles.actionMenuTitle}>Add Food</Text>
              
                <TouchableOpacity 
                  style={styles.actionMenuItem}
                  onPress={() => {
                    toggleActionMenu();
                    Alert.alert('📸 Photo Scan', 'Camera feature coming soon!');
                  }}
                >
                  <View style={styles.actionMenuIconContainer}>
                    <Text style={styles.actionMenuIcon}>📸</Text>
                  </View>
                  <View style={styles.actionMenuTextContainer}>
                    <Text style={styles.actionMenuItemText}>Take Photo</Text>
                    <Text style={styles.actionMenuItemSubtext}>Snap & analyze</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionMenuItem}
                  onPress={() => {
                    toggleActionMenu();
                    Alert.alert('💬 AI Chat', 'Describe food feature coming soon!');
                  }}
                >
                  <View style={styles.actionMenuIconContainer}>
                    <Text style={styles.actionMenuIcon}>💬</Text>
                  </View>
                  <View style={styles.actionMenuTextContainer}>
                    <Text style={styles.actionMenuItemText}>Describe Food</Text>
                    <Text style={styles.actionMenuItemSubtext}>Chat with AI</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionMenuItem}
                  onPress={() => {
                    toggleActionMenu();
                    Alert.alert('📊 Barcode', 'Barcode scanner coming soon!');
                  }}
                >
                  <View style={styles.actionMenuIconContainer}>
                    <Text style={styles.actionMenuIcon}>📊</Text>
                  </View>
                  <View style={styles.actionMenuTextContainer}>
                    <Text style={styles.actionMenuItemText}>Scan Barcode</Text>
                    <Text style={styles.actionMenuItemSubtext}>Quick lookup</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionMenuItem, styles.actionMenuItemLast]}
                  onPress={() => {
                    toggleActionMenu();
                    Alert.alert('✏️ Manual Entry', 'Manual entry coming soon!');
                  }}
                >
                  <View style={styles.actionMenuIconContainer}>
                    <Text style={styles.actionMenuIcon}>✏️</Text>
                  </View>
                  <View style={styles.actionMenuTextContainer}>
                    <Text style={styles.actionMenuItemText}>Add Manually</Text>
                    <Text style={styles.actionMenuItemSubtext}>Type it in</Text>
                  </View>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          </Pressable>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  brandingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 28,
  },
  brandText: {
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  appTagline: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  glassCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  percentageBadge: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  calorieCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  calorieCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  calorieRemainingLarge: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 70,
  },
  calorieUnitSmall: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sectionTitleDark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mealCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  mealCountDark: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  macrosContainer: {
    gap: 12,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  macroLabelWhite: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  macroValueLarge: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  macroTarget: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  macroBarBackground: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBarDark: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroBarFillGlow: {
    height: '100%',
    borderRadius: 3,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  foodList: {
    gap: 12,
  },
  foodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  foodMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  foodNameDark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  foodTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  foodTimeDark: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  foodCalories: {
    alignItems: 'flex-end',
  },
  foodCaloriesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  foodCaloriesValueDark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  foodCaloriesLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  foodCaloriesLabelDark: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  foodMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  foodMacroItem: {
    alignItems: 'center',
  },
  foodMacroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  foodMacroValueDark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  foodMacroLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  foodMacroLabelDark: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
  },
  fabInner: {
    flex: 1,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionMenuContainer: {
    width: '100%',
    maxWidth: 400,
  },
  actionMenu: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
  },
  actionMenuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(242, 242, 247, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 12,
  },
  actionMenuItemLast: {
    marginBottom: 0,
  },
  actionMenuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionMenuIcon: {
    fontSize: 24,
  },
  actionMenuTextContainer: {
    flex: 1,
  },
  actionMenuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionMenuItemSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
})