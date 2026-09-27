import * as Notifications from 'expo-notifications';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccount } from '@/account/account-provider';
import { brand, content, theme, type ChoiceOption } from '@/brand';
import { BrandMark } from '@/components/brand-mark';
import { PillButton } from '@/components/pill-button';
import { usePreferences } from '@/preferences/preferences-provider';

const STEPS = ['intro', 'shopFor', 'activities', 'size', 'notifications', 'done'] as const;
type Step = (typeof STEPS)[number];
const QUESTION_COUNT = 4; // shopFor … notifications show the progress bar

const copy = content.onboarding;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { preferences, update } = usePreferences();
  const { customer } = useAccount();
  // Opened from Profile to edit answers, rather than first-run onboarding.
  const [editing] = useState(preferences.onboarded);
  const [step, setStep] = useState<Step>(editing ? 'shopFor' : 'intro');
  const [shopFor, setShopFor] = useState(preferences.shopFor);
  const [activities, setActivities] = useState(preferences.activities);
  const [size, setSize] = useState(preferences.size);

  const next = () => setStep(STEPS[STEPS.indexOf(step) + 1]);

  const save = () => update({ shopFor, activities, size });

  const finish = () => {
    if (editing) {
      save();
      router.back();
    } else {
      update({ shopFor, activities, size, onboarded: true });
    }
  };

  const askForNotifications = async () => {
    await Notifications.requestPermissionsAsync().catch(() => {});
    if (editing) finish();
    else next();
  };

  // First run: once onboarding is saved the tabs become available.
  useEffect(() => {
    if (!editing && preferences.onboarded) router.replace('/');
  }, [editing, preferences.onboarded]);

  // The welcome step moves on by itself.
  useEffect(() => {
    if (step !== 'done') return;
    const timer = setTimeout(finish, 2200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const questionIndex = STEPS.indexOf(step) - 1;
  const showProgress = questionIndex >= 0 && questionIndex < QUESTION_COUNT;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="light" />
      {showProgress && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((questionIndex + 1) / QUESTION_COUNT) * 100}%` }]} />
        </View>
      )}

      <Animated.View key={step} entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.flex}>
        {step === 'intro' && (
          <View style={styles.flex}>
            <IntroCollage />
            <Text style={[styles.introTitle, { top: insets.top + 24 }]}>{copy.intro.title}</Text>
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
              <PillButton title="Get Started" onPress={next} />
            </View>
          </View>
        )}

        {step === 'shopFor' && (
          <Question title={copy.shopFor.title} bottomInset={insets.bottom} onNext={next} canContinue={shopFor.length > 0}>
            <ChoiceList options={copy.shopFor.options} selected={shopFor} onChange={setShopFor} />
          </Question>
        )}

        {step === 'activities' && (
          <Question title={copy.activities.title} bottomInset={insets.bottom} onNext={next} canContinue={activities.length > 0}>
            <ChoiceList options={copy.activities.options} selected={activities} onChange={setActivities} />
          </Question>
        )}

        {step === 'size' && (
          <Question title={copy.size.title} bottomInset={insets.bottom} onNext={next} canContinue={!!size} skippable>
            <View style={styles.sizeGrid}>
              {copy.size.options.map((option) => {
                const active = option === size;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setSize(active ? undefined : option)}
                    style={[styles.sizeChip, active && styles.sizeChipActive]}>
                    <Text style={[styles.sizeLabel, active && styles.sizeLabelActive]}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Question>
        )}

        {step === 'notifications' && (
          <View style={[styles.flex, styles.padded]}>
            <Text style={styles.title}>{copy.notifications.title}</Text>
            <Text style={styles.body}>{copy.notifications.body}</Text>
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
              <PillButton title="Next" onPress={askForNotifications} />
            </View>
          </View>
        )}

        {step === 'done' && (
          <View style={[styles.flex, styles.padded, styles.done]}>
            <BrandMark height={34} color="#FFFFFF" />
            <Text style={styles.doneTitle}>
              {customer?.firstName ? `Hi ${customer.firstName},\n` : ''}Welcome to {brand.name}.
            </Text>
            <Text style={styles.doneSubtitle}>{content.tagline}</Text>
            {customer && (
              <Text style={[styles.memberSince, { bottom: insets.bottom + 24 }]}>
                Member since {new Date(customer.creationDate).getFullYear()}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function IntroCollage() {
  const [a, b, c, d, e, f] = copy.intro.images;
  return (
    <View style={styles.collage}>
      <View style={styles.collageColumn}>
        <View style={{ height: 150 }} />
        <CollageImage source={a} height={260} />
        <CollageImage source={c} height={320} />
        <CollageImage source={e} height={220} />
      </View>
      <View style={styles.collageColumn}>
        <View style={{ height: 70 }} />
        <CollageImage source={b} height={330} />
        <CollageImage source={d} height={250} />
        <CollageImage source={f} height={300} />
      </View>
      <View style={styles.collageShade} />
    </View>
  );
}

function CollageImage({ source, height }: { source: number | undefined; height: number }) {
  if (source === undefined) return null;
  return <Image source={source} style={[styles.collageImage, { height }]} contentFit="cover" />;
}

function Question({
  title,
  children,
  onNext,
  canContinue,
  skippable,
  bottomInset,
}: {
  title: string;
  children: React.ReactNode;
  onNext: () => void;
  canContinue: boolean;
  skippable?: boolean;
  bottomInset: number;
}) {
  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={[styles.padded, { paddingBottom: 120 }]}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: bottomInset + 16 }]}>
        {canContinue || !skippable ? (
          <PillButton title="Next" onPress={onNext} disabled={!canContinue} />
        ) : (
          <PillButton title="Skip" variant="outline" onPress={onNext} />
        )}
      </View>
    </View>
  );
}

function ChoiceList({
  options,
  selected,
  onChange,
}: {
  options: ChoiceOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <View style={styles.choices}>
      {options.map((option, i) => {
        const active = selected.includes(option.id);
        return (
          <Pressable
            key={option.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            onPress={() => toggle(option.id)}
            style={[styles.choice, i > 0 && styles.choiceDivider]}>
            {option.image !== undefined && (
              <Image source={option.image} style={styles.choiceImage} contentFit="cover" />
            )}
            <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{option.label}</Text>
            <View style={[styles.radio, active && styles.radioActive]}>
              {active && <View style={styles.radioDot} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const DARK = theme.primary;
const MUTED = 'rgba(255,255,255,0.6)';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK },
  flex: { flex: 1 },
  padded: { paddingHorizontal: 28, paddingTop: 32 },
  progressTrack: {
    height: 4,
    marginHorizontal: 90,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: '#FFFFFF' },
  title: { color: '#FFFFFF', fontSize: 28, lineHeight: 34, fontWeight: '500', letterSpacing: -0.3 },
  body: { color: MUTED, fontSize: 17, lineHeight: 24, marginTop: 16 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },

  collage: { ...StyleSheet.absoluteFill, flexDirection: 'row', gap: 14, paddingHorizontal: 14 },
  collageColumn: { flex: 1, gap: 14 },
  collageImage: { width: '100%', borderRadius: 14 },
  collageShade: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: `linear-gradient(to bottom, ${DARK} 0%, rgba(14,26,36,0.55) 35%, rgba(14,26,36,0.3) 70%, ${DARK} 100%)`,
  },
  introTitle: {
    position: 'absolute',
    left: 28,
    right: 28,
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '500',
    letterSpacing: -0.3,
  },

  choices: { marginTop: 36 },
  choice: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, gap: 20 },
  choiceDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.25)' },
  choiceImage: { width: 64, height: 64, borderRadius: 32 },
  choiceLabel: { flex: 1, color: MUTED, fontSize: 19, fontWeight: '500' },
  choiceLabelActive: { color: '#FFFFFF' },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#FFFFFF', backgroundColor: '#FFFFFF' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DARK },

  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 36 },
  sizeChip: {
    width: '30%',
    flexGrow: 1,
    height: 58,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeChipActive: { backgroundColor: '#FFFFFF' },
  sizeLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  sizeLabelActive: { color: DARK },

  done: { justifyContent: 'center', gap: 20 },
  doneTitle: { color: '#FFFFFF', fontSize: 32, lineHeight: 40, fontWeight: '500', letterSpacing: -0.4 },
  doneSubtitle: { color: MUTED, fontSize: 22, lineHeight: 29 },
  memberSince: { position: 'absolute', left: 28, color: MUTED, fontSize: 15 },
});
