import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import {
  calculateTDEE,
  adjustForGoal,
  calculateMacros,
  lbsToKg,
  kgToLbs,
  cmToFeet,
  feetToCm,
  validateAge,
  validateHeight,
  validateWeight,
  getActivityDescription,
  getGoalDescription,
  type Sex,
  type ActivityLevel,
  type Goal,
} from '@/lib/tdee-calculator';

type Unit = 'metric' | 'imperial';

interface FormData {
  age: string;
  height: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  sex: Sex | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  targetWeight: string;
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [unit, setUnit] = useState<Unit>('metric');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    age: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    sex: null,
    activityLevel: null,
    goal: null,
    targetWeight: '',
  });

  const totalSteps = 5;

  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return true; // Welcome screen, no validation needed
      case 2:
        const age = parseInt(formData.age);
        const heightCm = unit === 'metric' 
          ? parseFloat(formData.height)
          : feetToCm(parseInt(formData.heightFeet), parseInt(formData.heightInches));
        const weightKg = unit === 'metric'
          ? parseFloat(formData.weight)
          : lbsToKg(parseFloat(formData.weight));

        if (!validateAge(age)) {
          Alert.alert('Invalid Age', 'Please enter a valid age between 13 and 120');
          return false;
        }
        if (!validateHeight(heightCm)) {
          Alert.alert('Invalid Height', 'Please enter a valid height');
          return false;
        }
        if (!validateWeight(weightKg)) {
          Alert.alert('Invalid Weight', 'Please enter a valid weight');
          return false;
        }
        if (!formData.sex) {
          Alert.alert('Missing Info', 'Please select your biological sex');
          return false;
        }
        return true;
      case 3:
        if (!formData.activityLevel) {
          Alert.alert('Missing Info', 'Please select your activity level');
          return false;
        }
        return true;
      case 4:
        if (!formData.goal) {
          Alert.alert('Missing Info', 'Please select your goal');
          return false;
        }
        if (formData.goal !== 'maintain' && !formData.targetWeight) {
          Alert.alert('Missing Info', 'Please enter your target weight');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Get user data
      const { data: { user } } = await supabase.auth.getUser();
      
      // Convert to metric for storage/calculation
      const heightCm = unit === 'metric' 
        ? parseFloat(formData.height)
        : feetToCm(parseInt(formData.heightFeet), parseInt(formData.heightInches));
      const weightKg = unit === 'metric'
        ? parseFloat(formData.weight)
        : lbsToKg(parseFloat(formData.weight));
      const targetWeightKg = formData.targetWeight
        ? (unit === 'metric' ? parseFloat(formData.targetWeight) : lbsToKg(parseFloat(formData.targetWeight)))
        : weightKg;

      // Calculate TDEE and macros
      const tdee = calculateTDEE(
        weightKg,
        heightCm,
        parseInt(formData.age),
        formData.sex!,
        formData.activityLevel!
      );
      const dailyCalories = adjustForGoal(tdee, formData.goal!);
      const macros = calculateMacros(dailyCalories);

      // If user is authenticated, save to database
      if (user) {
        const { error } = await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          age: parseInt(formData.age),
          height: heightCm,
          weight: weightKg,
          sex: formData.sex,
          activity_level: formData.activityLevel,
          goal: formData.goal,
          target_weight: targetWeightKg,
          daily_calorie_target: dailyCalories,
          daily_protein_target: macros.protein,
          daily_carbs_target: macros.carbs,
          daily_fat_target: macros.fat,
          onboarding_completed: true,
        });

        if (error) throw error;
      } else {
        // For guest users, store data in local storage or just proceed
        console.log('Guest user - onboarding data not saved to database');
        // TODO: Store in AsyncStorage if needed for guest users
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Error', error.message || 'Failed to save your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
      <View style={styles.progressBar}>
        {[...Array(totalSteps)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index < currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🥗</Text>
      <Text style={styles.title}>Welcome to NutriSnap!</Text>
      <Text style={styles.subtitle}>
        Let's personalize your nutrition journey
      </Text>
      <Text style={styles.description}>
        We'll calculate your daily calorie and macro targets based on your goals and activity level.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Basic Information</Text>
      
      {/* Unit Toggle */}
      <View style={styles.unitToggle}>
        <TouchableOpacity
          style={[styles.unitButton, unit === 'metric' && styles.unitButtonActive]}
          onPress={() => setUnit('metric')}
        >
          <Text style={[styles.unitButtonText, unit === 'metric' && styles.unitButtonTextActive]}>
            Metric
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unitButton, unit === 'imperial' && styles.unitButtonActive]}
          onPress={() => setUnit('imperial')}
        >
          <Text style={[styles.unitButtonText, unit === 'imperial' && styles.unitButtonTextActive]}>
            Imperial
          </Text>
        </TouchableOpacity>
      </View>

      {/* Age */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          keyboardType="number-pad"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
        />
      </View>

      {/* Height */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Height {unit === 'metric' ? '(cm)' : '(ft/in)'}</Text>
        {unit === 'metric' ? (
          <TextInput
            style={styles.input}
            placeholder=""
            keyboardType="decimal-pad"
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
          />
        ) : (
          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Feet"
              keyboardType="number-pad"
              value={formData.heightFeet}
              onChangeText={(text) => setFormData({ ...formData, heightFeet: text })}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Inches"
              keyboardType="number-pad"
              value={formData.heightInches}
              onChangeText={(text) => setFormData({ ...formData, heightInches: text })}
            />
          </View>
        )}
      </View>

      {/* Weight */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weight {unit === 'metric' ? '(kg)' : '(lbs)'}</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          keyboardType="decimal-pad"
          value={formData.weight}
          onChangeText={(text) => setFormData({ ...formData, weight: text })}
        />
      </View>

      {/* Sex */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Biological Sex</Text>
        <View style={styles.radioGroup}>
          {(['male', 'female', 'other'] as Sex[]).map((sex) => (
            <TouchableOpacity
              key={sex}
              style={[
                styles.radioButton,
                formData.sex === sex && styles.radioButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, sex })}
            >
              <Text style={[
                styles.radioButtonText,
                formData.sex === sex && styles.radioButtonTextActive,
              ]}>
                {sex.charAt(0).toUpperCase() + sex.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Activity Level</Text>
      <Text style={styles.subtitle}>How active are you?</Text>

      <View style={styles.optionsList}>
        {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as ActivityLevel[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.optionCard,
              formData.activityLevel === level && styles.optionCardActive,
            ]}
            onPress={() => setFormData({ ...formData, activityLevel: level })}
          >
            <Text style={[
              styles.optionTitle,
              formData.activityLevel === level && styles.optionTitleActive,
            ]}>
              {level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
            <Text style={[
              styles.optionDescription,
              formData.activityLevel === level && styles.optionDescriptionActive,
            ]}>
              {getActivityDescription(level)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Your Goal</Text>
      <Text style={styles.subtitle}>What do you want to achieve?</Text>

      <View style={styles.optionsList}>
        {(['lose', 'maintain', 'gain'] as Goal[]).map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.optionCard,
              formData.goal === goal && styles.optionCardActive,
            ]}
            onPress={() => setFormData({ ...formData, goal })}
          >
            <Text style={[
              styles.optionTitle,
              formData.goal === goal && styles.optionTitleActive,
            ]}>
              {goal === 'lose' ? '🔽' : goal === 'maintain' ? '➡️' : '🔼'} {getGoalDescription(goal).split(' (')[0]}
            </Text>
            <Text style={[
              styles.optionDescription,
              formData.goal === goal && styles.optionDescriptionActive,
            ]}>
              {getGoalDescription(goal).match(/\(([^)]+)\)/)?.[1] || ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Target Weight (if not maintaining) */}
      {formData.goal && formData.goal !== 'maintain' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Weight {unit === 'metric' ? '(kg)' : '(lbs)'}</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            keyboardType="decimal-pad"
            value={formData.targetWeight}
            onChangeText={(text) => setFormData({ ...formData, targetWeight: text })}
          />
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep5 = () => {
    // Calculate preview values
    const heightCm = unit === 'metric' 
      ? parseFloat(formData.height)
      : feetToCm(parseInt(formData.heightFeet), parseInt(formData.heightInches));
    const weightKg = unit === 'metric'
      ? parseFloat(formData.weight)
      : lbsToKg(parseFloat(formData.weight));

    const tdee = calculateTDEE(
      weightKg,
      heightCm,
      parseInt(formData.age),
      formData.sex!,
      formData.activityLevel!
    );
    const dailyCalories = adjustForGoal(tdee, formData.goal!);
    const macros = calculateMacros(dailyCalories);

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Your Nutrition Plan</Text>
        <Text style={styles.subtitle}>Here's your personalized plan</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Age:</Text>
            <Text style={styles.summaryValue}>{formData.age} years</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Height:</Text>
            <Text style={styles.summaryValue}>
              {unit === 'metric' 
                ? `${formData.height} cm` 
                : `${formData.heightFeet}'${formData.heightInches}"`
              }
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Weight:</Text>
            <Text style={styles.summaryValue}>
              {formData.weight} {unit === 'metric' ? 'kg' : 'lbs'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Goal:</Text>
            <Text style={styles.summaryValue}>
              {formData.goal && getGoalDescription(formData.goal).split(' (')[0]}
            </Text>
          </View>
        </View>

        <View style={styles.calorieCard}>
          <Text style={styles.calorieLabel}>Daily Calorie Target</Text>
          <Text style={styles.calorieValue}>{dailyCalories}</Text>
          <Text style={styles.calorieUnit}>calories</Text>
        </View>

        <View style={styles.macrosCard}>
          <Text style={styles.macrosTitle}>Macronutrient Targets</Text>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Protein:</Text>
            <Text style={styles.macroValue}>{macros.protein}g</Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Carbs:</Text>
            <Text style={styles.macroValue}>{macros.carbs}g</Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Fat:</Text>
            <Text style={styles.macroValue}>{macros.fat}g</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
          onPress={handleComplete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Complete Setup</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#1a1a1a', '#2d3748', '#1f4037', '#99f2c8']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {renderProgressBar()}
            
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}

            <View style={styles.card}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 60 : 80,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#3ecf8e',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  stepContainer: {
    gap: 20,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#3ecf8e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#999',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: '#fff',
  },
  unitButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#3ecf8e',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: '#3ecf8e',
    borderColor: '#3ecf8e',
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  radioButtonTextActive: {
    color: '#fff',
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
  },
  optionCardActive: {
    backgroundColor: '#e6f9f3',
    borderColor: '#3ecf8e',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  optionTitleActive: {
    color: '#3ecf8e',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionActive: {
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  calorieCard: {
    backgroundColor: '#3ecf8e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  calorieUnit: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  macrosCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  macroLabel: {
    fontSize: 16,
    color: '#666',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3ecf8e',
  },
});
