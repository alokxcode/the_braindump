import useTheme from "@/hooks/useTheme";
import React, { useEffect, useMemo, useRef } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

type ThoughtNode = {
  _id: string;
  text: string;
  _creationTime: number;
};

interface ThoughtRoadTimelineProps {
  thoughts: ThoughtNode[];
  onPressThought: (thought: ThoughtNode) => void;
}

const formatTime = (timestamp: number) => {
  const formatted = new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formatted.replace(/\s?([ap])\.?m\.?/i, (_full, period) => {
    return ` ${String(period).toUpperCase()}M`;
  });
};

const getWrappedLines = (text: string, maxCharsPerLine: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
};

// Cycling card fill + text color pairs
const CARD_COLORS = [
  { fill: "#FEF3C7", text: "#78350F" },
  { fill: "#D1FAE5", text: "#064E3B" },
  { fill: "#DBEAFE", text: "#1E3A5F" },
  { fill: "#EDE9FE", text: "#3B0764" },
  { fill: "#FCE7F3", text: "#831843" },
  { fill: "#FEE2E2", text: "#7F1D1D" },
  { fill: "#E0F2FE", text: "#0C4A6E" },
];

const CARD_W = 210;
const CARD_H = 112;
const NODE_R = 8;
const CARD_OFFSET = 28; // horizontal gap between node dot and card edge
const CARD_SIDE_MARGIN = 10;
const NODE_CURVE_BEND = 34;

const ThoughtRoadTimeline = ({
  thoughts,
  onPressThought,
}: ThoughtRoadTimelineProps) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const previousThoughtCount = useRef(0);

  const sortedThoughts = useMemo(
    () => [...thoughts].sort((a, b) => a._creationTime - b._creationTime),
    [thoughts],
  );

  const PAD_TOP = 64;
  const PAD_BOT = 72;
  const NODE_SPACING = 180;
  const svgWidth = Math.max(width - 24, 320);
  const svgHeight = Math.max(
    600,
    PAD_TOP + PAD_BOT + Math.max(0, sortedThoughts.length - 1) * NODE_SPACING,
  );
  const usableH = svgHeight - PAD_TOP - PAD_BOT;
  const roadCX = svgWidth / 2;

  // Compute node positions along an S-curve
  const nodes = useMemo(() => {
    return sortedThoughts.map((thought, i) => {
      const progress =
        sortedThoughts.length <= 1 ? 0 : i / (sortedThoughts.length - 1);
      const wobble = Math.sin(progress * Math.PI * 2.5) * 48;
      const x = roadCX + wobble;
      const y = PAD_TOP + progress * usableH;
      const isRight = i % 2 === 0;
      return { thought, x, y, isRight };
    });
  }, [sortedThoughts, svgWidth, svgHeight]);

  const nodeCurves = useMemo(() => {
    const curves: { key: string; d: string }[] = [];

    for (let i = 0; i < nodes.length - 1; i += 1) {
      const start = nodes[i];
      const end = nodes[i + 1];
      const midY = (start.y + end.y) / 2;
      const direction = i % 2 === 0 ? 1 : -1;
      const controlX = (start.x + end.x) / 2 + direction * NODE_CURVE_BEND;
      const d = `M ${start.x} ${start.y} Q ${controlX} ${midY} ${end.x} ${end.y}`;
      curves.push({ key: `${start.thought._id}-${end.thought._id}`, d });
    }

    return curves;
  }, [nodes]);

  // Cloud organic path centered at (cx, cy)
  const cloudPath = (cx: number, cy: number, w: number, h: number): string => {
    const l = cx - w / 2,
      r = cx + w / 2;
    const t = cy - h / 2,
      b = cy + h / 2;
    const rx = w * 0.11,
      ry = h * 0.13;
    return (
      `M ${l + rx} ${t} ` +
      `Q ${cx - w * 0.2} ${t - ry * 1.1}, ${cx} ${t - ry} ` +
      `Q ${cx + w * 0.2} ${t - ry * 1.1}, ${r - rx} ${t} ` +
      `Q ${r + rx * 0.5} ${t}, ${r} ${t + ry} ` +
      `Q ${r + rx * 0.3} ${cy}, ${r} ${b - ry} ` +
      `Q ${r - rx * 0.3} ${b + ry * 0.25}, ${cx + w * 0.16} ${b + ry * 0.45} ` +
      `Q ${cx + w * 0.06} ${b + ry}, ${cx - w * 0.06} ${b + ry * 0.85} ` +
      `Q ${cx - w * 0.22} ${b + ry * 1.1}, ${l + rx * 1.1} ${b + ry * 0.35} ` +
      `Q ${l - rx * 0.3} ${b}, ${l} ${b - ry} ` +
      `Q ${l - rx * 0.5} ${cy}, ${l} ${t + ry} ` +
      `Q ${l - rx * 0.3} ${t}, ${l + rx} ${t} Z`
    );
  };

  useEffect(() => {
    const currentCount = sortedThoughts.length;
    const previousCount = previousThoughtCount.current;

    if (currentCount > previousCount) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }

    if (previousCount === 0 && currentCount > 0) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
    }

    previousThoughtCount.current = currentCount;
  }, [sortedThoughts.length]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.canvas, { width: svgWidth, height: svgHeight }]}>
        {/* Base SVG layer: curved node links, node-card connectors, dots */}
        <Svg
          width={svgWidth}
          height={svgHeight}
          style={StyleSheet.absoluteFill}
        >
          {/* Curved lines connecting thought nodes */}
          {nodeCurves.map((curve) => (
            <Path
              key={`curve-${curve.key}`}
              d={curve.d}
              stroke={colors.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              opacity={0.32}
            />
          ))}

          {/* Connector dashed lines: node → card */}
          {nodes.map(({ thought, x, y, isRight }) => {
            const rawLeft = isRight
              ? x + CARD_OFFSET
              : x - CARD_OFFSET - CARD_W;
            const cardLeft = Math.max(
              CARD_SIDE_MARGIN,
              Math.min(svgWidth - CARD_W - CARD_SIDE_MARGIN, rawLeft),
            );
            const cardEdgeX = isRight ? cardLeft : cardLeft + CARD_W;

            return (
              <Line
                key={`conn-${thought._id}`}
                x1={x}
                y1={y}
                x2={cardEdgeX}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.45}
              />
            );
          })}

          {/* Node dots */}
          {nodes.map(({ thought, x, y }, i) => {
            const { fill, text: tc } = CARD_COLORS[i % CARD_COLORS.length];
            const isLast = i === nodes.length - 1;
            return (
              <React.Fragment key={`dot-${thought._id}`}>
                <Circle
                  cx={x}
                  cy={y}
                  r={isLast ? NODE_R + 2 : NODE_R}
                  fill={fill}
                  stroke={tc}
                  strokeWidth={1.5}
                  opacity={0.92}
                />
                <Circle cx={x} cy={y} r={3.5} fill={tc} opacity={0.55} />
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Cloud cards as absolute-positioned TouchableOpacity */}
        {nodes.map(({ thought, x, y, isRight }, i) => {
          const { fill, text: textColor } = CARD_COLORS[i % CARD_COLORS.length];
          const rawLeft = isRight ? x + CARD_OFFSET : x - CARD_OFFSET - CARD_W;
          const cardLeft = Math.max(
            CARD_SIDE_MARGIN,
            Math.min(svgWidth - CARD_W - CARD_SIDE_MARGIN, rawLeft),
          );
          const cardTop = y - CARD_H / 2 - 10;
          const lines = getWrappedLines(thought.text, 24);

          return (
            <TouchableOpacity
              key={thought._id}
              activeOpacity={0.8}
              onPress={() => onPressThought(thought)}
              style={[
                styles.cardAnchor,
                {
                  left: cardLeft,
                  top: cardTop,
                  width: CARD_W,
                  height: CARD_H + 20,
                  zIndex: nodes.length - i,
                  transform: [
                    { perspective: 900 },
                    { rotateZ: isRight ? "-1.2deg" : "1.2deg" },
                  ],
                },
              ]}
            >
              {/* Cloud shape */}
              <Svg
                width={CARD_W}
                height={CARD_H + 20}
                style={StyleSheet.absoluteFill}
              >
                <Path
                  d={cloudPath(
                    CARD_W / 2,
                    (CARD_H + 20) / 2,
                    CARD_W - 6,
                    CARD_H - 8,
                  )}
                  fill={fill}
                />
              </Svg>

              {/* Time badge */}
              <View style={[styles.timeBadge, { backgroundColor: textColor }]}>
                <Text style={[styles.timeBadgeText, { color: fill }]}>
                  {formatTime(thought._creationTime)}
                </Text>
              </View>

              {/* Text content */}
              <View style={styles.cardContent}>
                {lines.slice(0, 4).map((line, li) => (
                  <Text
                    key={li}
                    style={[styles.thoughtLine, { color: textColor }]}
                    numberOfLines={1}
                  >
                    {line}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 32,
    paddingTop: 8,
  },
  canvas: {
    alignSelf: "center",
    position: "relative",
  },
  cardAnchor: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  timeBadge: {
    position: "absolute",
    top: 4,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    opacity: 0.9,
  },
  timeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  cardContent: {
    position: "absolute",
    top: 28,
    left: 20,
    right: 20,
    bottom: 12,
    justifyContent: "center",
  },
  thoughtLine: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
});

export default React.memo(ThoughtRoadTimeline);
