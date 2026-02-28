---
title: "Beyond Chatbots: Building AI Agents That Actually Do Things"
date: 2026-02-28
description: "Exploring the current capabilities of the Agentic Framework: 10+ LLM providers, local tools, MCP servers, and agents that write code, plan trips, and review PRs"
tags: ['python', 'ai', 'agents', 'mcp', 'llm']
---

## From Conversation to Action

When people talk about AI agents, they often mean "chatbots with tools." But there's a fundamental difference: **chatbots talk, agents act**.

Over the past few months, the Agentic Framework has evolved into something that goes well beyond simple Q&A. It's now a runtime for AI that can navigate codebases, orchestrate other agents, search real-time flight data, and even review your pull requests.

Let me walk you through what the framework can do today.

## 10+ LLM Providers, One Framework

One of the biggest pain points in AI development is provider lock-in. You start with one model, find it doesn't quite fit your use case, and suddenly you're rewriting code to switch providers.

The framework now supports **10+ LLM providers** out of the box:

| Provider | Use Case |
|----------|----------|
| **Anthropic** | State-of-the-art reasoning with Claude |
| **OpenAI** | GPT-4, GPT-4.1, o1 series |
| **Azure OpenAI** | Enterprise OpenAI deployments |
| **Google GenAI / Vertex** | Gemini models via API or GCP |
| **Groq** | Ultra-fast inference |
| **Mistral AI** | European privacy-focused models |
| **Cohere** | Enterprise RAG and Command models |
| **AWS Bedrock** | Anthropic, Titan, Meta via AWS |
| **Ollama** | Local LLMs with zero API cost |
| **Hugging Face** | Open models from the Hub |


## Agents That Write Code

The `developer` agent is a perfect example of what makes this framework different. It doesn't just answer questions about code—it can search, understand, and edit your codebase.

### Built-in Local Tools

These are zero-dependency tools that work out of the box:

| Tool | Capability |
|------|------------|
| `find_files` | Fast file search via `fd` |
| `discover_structure` | Directory tree mapping |
| `get_file_outline` | AST signature parsing for Python, TS, Go, Rust, Java, C++, PHP |
| `read_file_fragment` | Precise reading with line ranges |
| `code_search` | Global regex search via `ripgrep` |
| `edit_file` | Safe file editing with multiple formats |

The `edit_file` tool is particularly interesting. It supports multiple formats for maximum flexibility:

```json
// RECOMMENDED: No line numbers needed
{"op": "search_replace", "path": "file.py", "old": "exact text", "new": "replacement text"}

// Or use line-based operations
// replace:path:start:end:content | insert:path:after_line:content | delete:path:start:end
```

No more guessing line numbers—the agent can find and replace code reliably.

## The GitHub PR Reviewer

One of the newest additions is the `github-pr-reviewer` agent. It:

- Reviews PR diffs
- Posts inline comments
- Generates summary comments
- Can reply to review comments

This isn't a demo—it's a practical tool that integrates with your actual workflow. The agent understands code context and can provide meaningful feedback on changes.

> A special shoutout to [Rafael Zimmermann](https://github.com/rafaelzimmermann) for contributing this agent. His work showed firsthand how easy the framework is to use and extend—that "click" moment when everything comes together. If you're curious about building your own agents, his PR is a great example to follow.

## Multi-Agent Orchestration in Practice

The `travel-coordinator` agent demonstrates what multi-agent systems can do. It orchestrates three sub-agents to plan a trip:

1. **Flight Searcher** - Uses the `kiwi-com-flight-search` MCP server for real-time flight data
2. **Destination Researcher** - Uses `webfetch` to gather information about cities
3. **Itinerary Builder** - Combines everything into a coherent plan

All of this happens through the MCP integration, giving agents access to external capabilities without hardcoding API calls.

## Creating Your Own Agent

The philosophy remains the same: **write less, do more**. Here's the complete code for a custom agent:

```python
from agentic_framework.core.langgraph_agent import LangGraphMCPAgent
from agentic_framework.registry import AgentRegistry

@AgentRegistry.register("my-agent", mcp_servers=["webfetch"])
class MyAgent(LangGraphMCPAgent):
    @property
    def system_prompt(self) -> str:
        return "You are my custom agent with the power to fetch websites."
```

That's five lines of code. Run it instantly:

```bash
bin/agent.sh my-agent -i "Summarize https://example.com"
```

### Adding Custom Tools

When you need more than what's built-in, adding custom tools is straightforward:

```python
from langchain_core.tools import StructuredTool
from agentic_framework.core.langgraph_agent import LangGraphMCPAgent
from agentic_framework.registry import AgentRegistry

@AgentRegistry.register("data-processor")
class DataProcessorAgent(LangGraphMCPAgent):
    @property
    def system_prompt(self) -> str:
        return "You process data files like a boss."

    def local_tools(self) -> list:
        return [
            StructuredTool.from_function(
                func=self.process_csv,
                name="process_csv",
                description="Process a CSV file path",
            )
        ]

    def process_csv(self, filepath: str) -> str:
        # Magic happens here
        return f"Successfully processed {filepath}!"
```

## Docker-First Isolation

Every agent runs in isolated containers. This means:

- No "it works on my machine" issues
- Consistent environments across your team
- Easy deployment and scaling

```bash
make docker-build
bin/agent.sh developer -i "Explain this codebase"
```

## Under the Hood: LangGraph

The framework is powered by **LangGraph**, which brings:

- **Stateful execution** - Agents maintain conversation history
- **Cyclic reasoning** - Agents can loop back and refine their thinking
- **Human-in-the-loop workflows** - Pause for human input when needed
- **Checkpointing** - Resume conversations from any point

This is what separates simple tool-calling from true agentic behavior.

## The Architecture in a Glance

```
User Input → CLI → Agent Registry → Agent
                                      ↓
                              LangGraph Runtime
                                      ↓
                              +--------------+
                              |              |
                         Local Tools     MCP Tools
                              |              |
                              ↓              ↓
                          LLM API      MCP Servers
```

The CLI handles the routing, the registry manages agent discovery, and the core engine handles the actual execution with tools and LLMs.

## Quick Start (Zero to Agent in 60s)

If you want to try it yourself:

```bash
# Clone and build
git clone https://github.com/jeancsil/agentic-framework.git
cd agentic-framework
make docker-build

# Configure your API key
cp .env.example .env
# Edit .env with your preferred provider (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)

# Run an agent
bin/agent.sh developer -i "Explain this codebase"
bin/agent.sh chef -i "I have chicken, rice, and soy sauce. What can I make?"
bin/agent.sh travel -i "Find flights from SFO to LAX next weekend"
```

## What's Different About This Approach?

1. **Context Superpowers** - MCP integration means agents have access to live data (web search, APIs, databases)
2. **Hardcore Local Tools** - Built-in tools for exploring and understanding codebases
3. **Stateful Execution** - Powered by LangGraph, not just stateless function calls
4. **Docker Isolation** - Consistent environments with zero setup headaches
5. **Provider Flexibility** - Switch between 10+ LLM providers with a single environment variable change

## The Road Ahead

This is still early days for agentic AI. The framework continues to evolve with:

- New agents and tools
- Better debugging and tracing
- Streaming responses for real-time feedback
- More MCP server integrations

## Try It Out

If you're interested in building AI agents that go beyond simple chat, check out the [agentic-framework repository](https://github.com/jeancsil/agentic-framework). It's open source, well-tested (80%+ coverage), and ready to use.

The future of software development isn't just about writing code—it's about building systems that can write, understand, and improve code. Let's build that future together.

---

<p align="center">
  If this project helps you in any way, consider buying me a coffee!<br><br>
  <a href="https://www.buymeacoffee.com/jeancsil" target="_blank">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee">
  </a>
</p>
