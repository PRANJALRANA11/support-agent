# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "openai",
#     "matplotlib",
#     "requests",
# ]
# ///
import json
import os
from pathlib import Path
import requests
import openai
from statistics import mean
import matplotlib.pyplot as plt

# =============== CONFIG ===============
INPUT_FILE = "firecrawl_dataset_v1.jsonl"
OUTPUT_FILE = "model_eval_results.jsonl"
USE_OPENAI = True  # set False for rule-based comparison
MODEL_TO_GRADE = "gpt-4o-mini"  # Your evaluation LLM
YOUR_MODEL_NAME = "gpt"  # Label in results
# =====================================

openai.api_key = os.getenv("OPENAI_API_KEY")


# ================== STEP 1: Your model inference ==================
def generate_model_response(query: str) -> str:
    """Send query (with conversation context) to your model endpoint."""
    try:
        response = requests.post("http://localhost:8000/generate", json={"query": query})
        response.raise_for_status()
        return response.json()["answer"]
    except Exception as e:
        print(f"❌ Model inference failed: {e}")
        return f"Error generating response for: {query[:50]}..."


# ================== STEP 2: Evaluation (AI or heuristic) ==================
def evaluate_with_llm(query, model_response, human_response):
    prompt = f"""
    You are evaluating how well an AI support agent responded compared to a human agent.

    Compare the model's response to the human resolution using these metrics:
    1. accuracy (0–1): factual correctness and alignment with the human answer
    2. clarity (1–5): how well the response communicates
    3. completeness (1–5): covers all necessary aspects
    4. empathy (1–5): tone and politeness
    5. technical_depth (1–5): use of correct technical detail
    6. similarity (0–1): semantic similarity with the human resolution

    Query:
    {query}

    Human Resolution:
    {human_response}

    Model Response:
    {model_response}

    Return a JSON object only:
    {{
      "accuracy": <float>,
      "clarity": <int>,
      "completeness": <int>,
      "empathy": <int>,
      "technical_depth": <int>,
      "similarity": <float>,
      "short_feedback": "<brief feedback>"
    }}
    """

    try:
        res = openai.chat.completions.create(
            model=MODEL_TO_GRADE,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        data = json.loads(res.choices[0].message.content)
    except Exception as e:
        print("⚠️ Evaluation LLM failed, fallback:", e)
        data = rule_based_comparison(query, model_response, human_response)

    overall = (
        (data["accuracy"] * 0.3)
        + (data["similarity"] * 0.2)
        + ((data["clarity"] + data["completeness"] + data["technical_depth"] + data["empathy"]) / 20) * 0.5
    ) * 5

    data["overall_score"] = round(overall, 2)
    return data


def rule_based_comparison(query, model_response, human_response):
    """Heuristic grading for offline use."""
    from difflib import SequenceMatcher

    similarity = SequenceMatcher(None, model_response, human_response).ratio()
    accuracy = 1.0 if similarity > 0.8 else 0.7 if similarity > 0.5 else 0.4
    clarity = 5 if len(model_response.split()) > 20 else 3
    completeness = 5 if len(model_response) >= len(human_response) * 0.8 else 3
    empathy = 4 if any(w in model_response.lower() for w in ["please", "thank", "sure"]) else 3
    technical_depth = 5 if any(t in model_response.lower() for t in ["api", "header", "json", "token"]) else 3

    overall = (
        (accuracy * 0.3)
        + (similarity * 0.2)
        + ((clarity + completeness + technical_depth + empathy) / 20) * 0.5
    ) * 5

    return {
        "accuracy": accuracy,
        "clarity": clarity,
        "completeness": completeness,
        "empathy": empathy,
        "technical_depth": technical_depth,
        "similarity": round(similarity, 3),
        "overall_score": round(overall, 2),
        "short_feedback": "Rule-based grading fallback.",
    }


# ================== STEP 3: Main runner ==================
def main():
    with open(INPUT_FILE, "r") as f:
        tickets = [json.loads(line) for line in f]

    graded = []
    for t in tickets:
        print(f"\nEvaluating ticket {t['id']}...")

        conversation_history = []  # keeps memory across queries

        for idx, q in enumerate(t["queries"], start=1):
            query = q["query"]
            human_resolution = q["resolution"]

            # include previous turns for memory
            context = "\n".join(
                f"User: {h['query']}\nAssistant: {h['model_response']}"
                for h in conversation_history
            )

            full_input = f"{context}\nUser: {query}" if context else query

            model_response = generate_model_response(full_input)

            eval_result = (
                evaluate_with_llm(query, model_response, human_resolution)
                if USE_OPENAI
                else rule_based_comparison(query, model_response, human_resolution)
            )

            graded.append({
                "ticket_id": t["id"],
                "turn": idx,
                "query": query,
                "human_resolution": human_resolution,
                "model_response": model_response,
                "model_name": YOUR_MODEL_NAME,
                **eval_result
            })

            # update conversation memory
            conversation_history.append({
                "query": query,
                "model_response": model_response
            })

    # Save results
    Path(OUTPUT_FILE).write_text("\n".join(json.dumps(r) for r in graded))

    # Summary
    avg_score = mean([r["overall_score"] for r in graded])
    print(f"\n✅ Done! Average Overall Score: {avg_score:.2f}")
    print(f"Results saved to {OUTPUT_FILE}")

    # ================== STEP 4: Visualization ==================
    plot_results(graded)


# ================== STEP 4: Plotting ==================
def plot_results(results):
    """Generate Matplotlib charts for metrics distribution."""
    metrics = ["accuracy", "clarity", "completeness", "empathy", "technical_depth", "similarity"]
    avg_values = [mean([r[m] for r in results]) for m in metrics]

    plt.figure(figsize=(10, 5))
    plt.bar(metrics, avg_values)
    plt.title("Average Metric Scores")
    plt.ylabel("Average Score")
    plt.grid(axis="y", linestyle="--", alpha=0.7)
    plt.tight_layout()
    plt.savefig("average_metrics.png")
    plt.show()

    plt.figure(figsize=(10, 5))
    plt.hist([r["overall_score"] for r in results], bins=10, edgecolor="black")
    plt.title("Distribution of Overall Scores")
    plt.xlabel("Overall Score")
    plt.ylabel("Count")
    plt.grid(axis="y", linestyle="--", alpha=0.7)
    plt.tight_layout()
    plt.savefig("score_distribution.png")
    plt.show()

    print("\n📊 Charts saved as 'average_metrics.png' and 'score_distribution.png'")


if __name__ == "__main__":
    main()
