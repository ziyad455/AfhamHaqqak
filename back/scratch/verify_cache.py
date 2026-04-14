import time
import sys
from agent import MoroccanLegalRAGAgent
from schemas import LegalAnalysisResponse

def test_caching():
    print("Initializing agent...")
    agent = MoroccanLegalRAGAgent()
    scenario = "أنا كنخدم فشركة خاصة وبغاو يوقفوني من الخدمة بلا إنذار مكتوب."
    
    print(f"--- Running first analysis for scenario: '{scenario}' ---")
    sys.stdout.flush()
    start_time = time.time()
    response1 = agent.analyze(scenario)
    duration1 = time.time() - start_time
    print(f"First run duration: {duration1:.2f}s")
    print(f"First run cache_hit: {response1.cache_hit}")
    sys.stdout.flush()
    
    print("\n--- Running second analysis (exact match) ---")
    sys.stdout.flush()
    start_time = time.time()
    response2 = agent.analyze(scenario)
    duration2 = time.time() - start_time
    print(f"Second run duration: {duration2:.2f}s")
    print(f"Second run cache_hit: {response2.cache_hit}")
    sys.stdout.flush()
    
    print("\n--- Running third analysis (different casing/whitespace) ---")
    sys.stdout.flush()
    scenario_variant = "  أنا كنخدم فشركة خاصة وبغاو يوقفوني من الخدمة بلا إنذار مكتوب.  "
    start_time = time.time()
    response3 = agent.analyze(scenario_variant)
    duration3 = time.time() - start_time
    print(f"Third run duration: {duration3:.2f}s")
    print(f"Third run cache_hit: {response3.cache_hit}")
    sys.stdout.flush()

    assert response1.cache_hit is False, "First run should not be a cache hit"
    assert response2.cache_hit is True, "Second run should be a cache hit"
    assert response3.cache_hit is True, "Third run should be a cache hit"
    # Duration assertions might be tricky if RAG is super fast (unlikely) or Cache is slow
    print(f"\nSUCCESS: Caching is working correctly! (Speedup: {duration1/duration2:.1f}x)")

if __name__ == "__main__":
    try:
        test_caching()
    except Exception as e:
        print(f"\nERROR during testing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
