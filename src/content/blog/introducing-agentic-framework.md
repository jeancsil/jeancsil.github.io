---
title: "Building AI Agents Made Simple: Introducing the Agentic Framework"
date: 2026-02-23
description: "A Python framework for building intelligent AI agents with LangChain and MCP integration"
tags: ['python', 'ai', 'agents', 'mcp', 'langchain']
---

## Why I Built It

Last year, I found myself diving deep into the world of AI agents. I wanted to build something that could understand my codebase, help me navigate complex projects, and even write code for me. But every time I tried to create a new agent, I hit the same wall: **boilerplate**.

Every agent needed the same setup—connecting to language models, defining tools, handling errors, managing state. It was repetitive, error-prone, and frankly, a bit frustrating. I knew there had to be a better way.

That's when I started building what would eventually become the **Agentic Framework**—a Python framework that makes building AI agents feel less like configuring a distributed system and more like writing Python code.

## What is the Agentic Framework?

The Agentic Framework is an open-source Python framework for building AI agents. It combines the power of **LangChain** for orchestration with **Model Context Protocol (MCP)** for extensibility, giving you:

- **Decorator-based registration** for painless agent creation
- **Multi-agent orchestration** to let agents work together
- **MCP integration** for external capabilities (web search, file systems, APIs)
- **Auto-generated CLI** for easy testing and deployment
- **Docker-first development** for consistent environments

The goal was simple: make it easy to build smart, capable agents without getting bogged down in infrastructure details.

## How It Works

The framework is built around a few core ideas:

```
+-----------------------------------------------------------+
|                    Agentic Framework                      |
+-----------------------------------------------------------+
|                                                           |
|   +-------------+          +-----------------------+      |
|   |     CLI     | -------->|    Agent Registry     |      |
|   |   (Typer)   |          |  (@register decorator)|      |
|   +-------------+          +-----------+-----------+      |
|                                        |                  |
|                            +-----------v-----------+      |
|                            |  LangGraph Base Agent |      |
|                            +-----------+-----------+      |
|                                        |                  |
|                 +----------------------+----------------+ |
|                 |                                       | |
|       +---------v--------+                    +---------v--------+
|       |   Local Tools    |                    |    MCP Tools     |
|       |   (Internal)     |                    |    (External)    |
|       +------------------+                    +------------------+
|                                                           |
+-----------------------------------------------------------+
```

### Agent Registration

Creating a new agent is as simple as writing a class with a `system_prompt` property:

```python
from agentic_framework.core.langgraph_agent import LangGraphMCPAgent
from agentic_framework.registry import AgentRegistry

@AgentRegistry.register("my-agent", mcp_servers=["web-search"])
class MyAgent(LangGraphMCPAgent):
    @property
    def system_prompt(self) -> str:
        return "You are a helpful assistant."
```

That's it. The decorator handles registration, the CLI is auto-generated, and your agent is ready to use.

### Local Tools

Agents can have local tools for working with your codebase:

```python
from agentic_framework.tools.codebase_explorer import (
    FindFilesTool,
    GetFileOutlineTool,
    EditFileTool
)

@AgentRegistry.register("developer")
class DeveloperAgent(LangGraphMCPAgent):
    def local_tools(self) -> list[Tool]:
        return [
            FindFilesTool(),
            GetFileOutlineTool(),
            EditFileTool()
        ]

    @property
    def system_prompt(self) -> str:
        return "You help developers understand and modify code."
```

These tools are built with safety in mind—atomic writes, Tree-sitter syntax validation, and proper error handling.

## Multi-Agent Magic

One of the most powerful features is multi-agent orchestration. Instead of a single monolithic agent, you can specialize:

```python
class FlightSpecialistAgent(LangGraphMCPAgent):
    @property
    def system_prompt(self) -> str:
        return "You search for flights and compare prices."

class CityIntelAgent(LangGraphMCPAgent):
    @property
    def system_prompt(self) -> str:
        return "You provide city information and recommendations."

class TravelCoordinatorAgent(Agent):
    def __init__(self):
        self._flight = FlightSpecialistAgent()
        self._city = CityIntelAgent()

    async def run(self, input_data: str) -> str:
        # Delegate to specialists
        flight_report = await self._flight.run(
            f"Find flights for: {input_data}"
        )
        city_report = await self._city.run(
            f"Provide city info for: {input_data}"
        )
        return f"""
        Flight Options:
        {flight_report}

        City Information:
        {city_report}
        """
```

Each agent focuses on what it does best, and the coordinator brings it all together.

## Under the Hood

### MCP Integration

The framework uses the Model Context Protocol to connect to external capabilities. MCP servers provide tools that agents can use—anything from web search to database queries to API calls.

The framework makes it easy to add any MCP server—simply configure the server URL and your agents can access its tools. This means you can:

- Search the web for up-to-date information
- Automate browser interactions
- Query databases directly
- Interact with APIs and services

### Safe File Editing

When agents write code, safety matters. The framework includes:

- **Atomic writes** - Changes only apply if they succeed
- **Tree-sitter validation** - Syntax errors are caught before writing
- **Backup preservation** - Original files are always preserved

## Getting Started

### Docker (Recommended)

No local setup required:

```bash
# Clone the repository
git clone https://github.com/jeancsil/agentic-framework.git
cd agentic-framework

# Build and run
make docker-build
bin/agent.sh developer -i "Explain the project structure"
```

### Local Development

Using `uv` for fast, consistent dependency management:

```bash
# Install dependencies
uv sync

# Run the developer agent
uv run agentic-run developer -i "Explain the project structure"

# List all available agents
uv run agentic-run list
```

## What Makes It Special

1. **Modern Python** - Built for Python 3.12+ with strict type hints
2. **Async throughout** - Non-blocking operations for better performance
3. **uv package manager** - Fast, consistent dependency management
4. **Docker-first** - No local environment pollution
5. **Comprehensive testing** - 80%+ coverage and strict linting
6. **Auto-generated CLI** - Your agents get a CLI for free
7. **Extensible architecture** - Easy to add new agents and tools

## What's Next?

The framework is actively evolving. Here's what's on the roadmap:

- **Memory management** - Agents that remember conversations
- **Streaming responses** - Real-time output for better UX
- **Agent composition DSL** - A declarative way to wire agents together
- **More tools** - Expanded toolkit for common tasks
- **Better debugging** - Tracing and visualization of agent execution

## Join the Journey

Building AI agents is still early days—there's so much to explore. The Agentic Framework is my contribution to making this technology more accessible to developers.

Whether you're building your first agent or you're deep in the weeds of multi-agent systems, I'd love to hear from you.

- **Check out the code**: [github.com/jeancsil/agentic-framework](https://github.com/jeancsil/agentic-framework)
- **Report issues**: We welcome bug reports and feature requests
- **Contribute**: Pull requests are always appreciated

AI agents are the future of software development. Let's build that future together.
