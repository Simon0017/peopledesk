import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("updates only after the value has stopped changing for the delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: "a" } });
    expect(result.current).toBe("a");

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "abc" }); // restarts the timer
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("a"); // still waiting

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("abc");
  });
});
