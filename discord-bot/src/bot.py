import discord
from discord import app_commands
from discord.ext import commands
import asyncio
import aiohttp
from aiohttp import web
import json
import logging
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Environment configuration
APP_ENV = os.getenv("APP_ENV", "development")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO" if APP_ENV == "production" else "DEBUG")

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info(f"Starting Discord bot in {APP_ENV} mode")

class ApprovalRequest:
    """Represents an active approval request"""
    def __init__(self, resume_webhook: str, request_data: dict = None):
        self.resume_webhook = resume_webhook
        self.request_data = request_data or {}
        self.timestamp = datetime.now()
        self.is_active = True
    
    def to_dict(self) -> dict:
        return {
            'resume_webhook': self.resume_webhook,
            'request_data': self.request_data,
            'timestamp': self.timestamp.isoformat(),
            'is_active': self.is_active
        }

class ApprovalBot(commands.Bot):
    """Discord bot for handling n8n approval workflows"""
    
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        
        super().__init__(
            command_prefix='!',
            intents=intents,
            description='N8N Approval Bot with Slash Commands'
        )
        
        # Store current approval request
        self.current_approval: ApprovalRequest = None
        self.approval_lock = asyncio.Lock()
        
        # HTTP session for webhook calls
        self.session: aiohttp.ClientSession = None
        
    async def setup_hook(self):
        """Called when the bot is starting up"""
        # Create HTTP session
        self.session = aiohttp.ClientSession()
        
        # Start HTTP server for n8n integration
        await self.start_http_server()
        
        # Sync slash commands
        try:
            synced = await self.tree.sync()
            logger.info(f"Synced {len(synced)} slash command(s)")
        except Exception as e:
            logger.error(f"Failed to sync commands: {e}")
    
    async def start_http_server(self):
        """Start HTTP server to receive requests from n8n"""
        app = web.Application()
        app.router.add_post('/approval-request', self.handle_approval_request)
        app.router.add_get('/health', self.health_check)
        
        runner = web.AppRunner(app)
        await runner.setup()
        
        port = int(os.getenv('HTTP_PORT', 54545))
        site = web.TCPSite(runner, '0.0.0.0', port)
        await site.start()
        
        logger.info(f"HTTP server started on port {port}")
    
    async def handle_approval_request(self, request):
        """Handle incoming approval requests from n8n"""
        try:
            data = await request.json()
            resume_webhook = data.get('resume_webhook')
            description = data.get('description', 'A workflow is waiting for your approval')
            request_data = data.get('request_data', '')
            request_content = data.get('request-content', {})
            session_id = data.get('sessionId')
            
            if not resume_webhook:
                return web.json_response({'error': 'resume_webhook is required'}, status=400)
            
            async with self.approval_lock:
                # Cancel previous approval if exists
                if self.current_approval and self.current_approval.is_active:
                    self.current_approval.is_active = False
                    await self.send_discord_message("❌ Previous approval request canceled - new request received")
                
                # Create new approval request
                self.current_approval = ApprovalRequest(resume_webhook, data)
                
                # First send the raw request data as a regular message (split if too long)
                if request_data:
                    await self.send_request_data_messages(request_data)
                
                # Then send the approval interaction embed (cleaner/shorter)
                embed = discord.Embed(
                    title="🔔 New Approval Request",
                    description=description,
                    color=discord.Color.orange(),
                    timestamp=self.current_approval.timestamp
                )
                
                embed.add_field(name="Actions", value="Use `/accept` to accept or `/reject <reason>` to reject", inline=False)
                
                await self.send_discord_embed(embed)
            
            return web.json_response({
                'status': 'approval_request_created',
                'timestamp': self.current_approval.timestamp.isoformat()
            })
        
        except Exception as e:
            logger.error(f"Error handling approval request: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def health_check(self, request):
        """Health check endpoint"""
        return web.json_response({
            'status': 'healthy',
            'bot_ready': self.is_ready(),
            'has_active_approval': self.current_approval is not None and self.current_approval.is_active
        })
    
    async def send_discord_message(self, message: str):
        """Send a text message to the configured Discord channel"""
        channel_id = int(os.getenv('DISCORD_CHANNEL_ID', '0'))
        if channel_id:
            channel = self.get_channel(channel_id)
            if channel:
                await channel.send(message)
            else:
                logger.error(f"Channel {channel_id} not found")
        else:
            logger.error("DISCORD_CHANNEL_ID not configured")
    
    async def send_discord_embed(self, embed: discord.Embed):
        """Send an embed to the configured Discord channel"""
        channel_id = int(os.getenv('DISCORD_CHANNEL_ID', '0'))
        if channel_id:
            channel = self.get_channel(channel_id)
            if channel:
                await channel.send(embed=embed)
            else:
                logger.error(f"Channel {channel_id} not found")
        else:
            logger.error("DISCORD_CHANNEL_ID not configured")
    
    async def send_request_data_messages(self, request_data: str):
        """Send request data, splitting into multiple messages if needed"""
        MAX_LENGTH = 1900  # Conservative limit to account for Discord's 2000 char limit
        
        if len(request_data) <= MAX_LENGTH:
            # Single message - same as before
            await self.send_discord_message(f"📋 **Request Details:**\n{request_data}")
        else:
            # Split into multiple numbered messages
            header_template = "📋 **Request Details (Part {}):**\n"
            remaining_data = request_data
            part_number = 1
            
            while remaining_data:
                # Calculate available space for this chunk
                current_header = header_template.format(part_number)
                available_space = MAX_LENGTH - len(current_header)
                
                if len(remaining_data) <= available_space:
                    # Last chunk
                    await self.send_discord_message(f"{current_header}{remaining_data}")
                    break
                else:
                    # Find a good split point (try to split at newlines)
                    split_point = available_space
                    newline_pos = remaining_data.rfind('\n', 0, available_space)
                    if newline_pos > available_space - 200:  # If newline is reasonably close
                        split_point = newline_pos
                    
                    chunk = remaining_data[:split_point]
                    await self.send_discord_message(f"{current_header}{chunk}")
                    
                    remaining_data = remaining_data[split_point:].lstrip('\n')
                    part_number += 1
    
    async def send_webhook_response(self, webhook_url: str, approved: bool, feedback: str = None) -> bool:
        """Send approval/rejection response to n8n webhook"""
        try:
            # Start with the original request data
            response_data = dict(self.current_approval.request_data)
            
            # Add approval response fields
            response_data.update({
                'approved': approved,
                'timestamp': datetime.now().isoformat()
            })
            
            if feedback:
                response_data['feedback'] = feedback
            
            async with self.session.post(webhook_url, json=response_data) as response:
                if response.status == 200:
                    logger.info(f"Successfully sent response to webhook: {response_data}")
                    return True
                else:
                    logger.error(f"Failed to send webhook response: {response.status}")
                    return False
        
        except Exception as e:
            logger.error(f"Error sending webhook response: {e}")
            return False
    
    async def on_ready(self):
        """Called when the bot is ready"""
        logger.info(f'{self.user} has connected to Discord!')
        logger.info(f'Bot is in {len(self.guilds)} guilds')
        
        # Send startup message to configured channel
        embed = discord.Embed(
            title="🤖 Bot Online",
            description="Discord approval bot is online and ready!",
            color=discord.Color.green()
        )
        await self.send_discord_embed(embed)
    
    async def close(self):
        """Clean up resources when bot shuts down"""
        if self.session:
            await self.session.close()
        await super().close()

# Create bot instance
bot = ApprovalBot()

@bot.tree.command(name="accept", description="Accept the pending approval request")
async def accept_command(interaction: discord.Interaction):
    """Accept the current approval request"""
    async with bot.approval_lock:
        if not bot.current_approval or not bot.current_approval.is_active:
            embed = discord.Embed(
                title="❌ No Active Request",
                description="No active approval request to accept",
                color=discord.Color.red()
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
            return
        
        # Mark as inactive and send response
        bot.current_approval.is_active = False
        webhook_url = bot.current_approval.resume_webhook
        success = await bot.send_webhook_response(webhook_url, True)
        
        if success:
            embed = discord.Embed(
                title="✅ Request Accepted",
                description="Request accepted! Response sent to n8n",
                color=discord.Color.green()
            )
            embed.add_field(name="Accepted by", value=interaction.user.mention, inline=True)
            embed.add_field(name="Timestamp", value=datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"), inline=True)
        else:
            embed = discord.Embed(
                title="✅ Request Accepted",
                description="Request accepted! ⚠️ Warning: Failed to send response to n8n",
                color=discord.Color.yellow()
            )
        
        await interaction.response.send_message(embed=embed)
        bot.current_approval = None

@bot.tree.command(name="reject", description="Reject the pending approval request with feedback")
@app_commands.describe(reason="Reason for rejecting the request")
async def reject_command(interaction: discord.Interaction, reason: str):
    """Reject the current approval request with feedback"""
    async with bot.approval_lock:
        if not bot.current_approval or not bot.current_approval.is_active:
            embed = discord.Embed(
                title="❌ No Active Request",
                description="No active approval request to reject",
                color=discord.Color.red()
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
            return
        
        # Mark as inactive and send response with feedback
        bot.current_approval.is_active = False
        webhook_url = bot.current_approval.resume_webhook
        success = await bot.send_webhook_response(webhook_url, False, reason)
        
        if success:
            embed = discord.Embed(
                title="❌ Request Rejected",
                description="Request rejected! Feedback sent to n8n",
                color=discord.Color.red()
            )
            embed.add_field(name="Rejected by", value=interaction.user.mention, inline=True)
            embed.add_field(name="Timestamp", value=datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"), inline=True)
            embed.add_field(name="Reason", value=reason, inline=False)
        else:
            embed = discord.Embed(
                title="❌ Request Rejected",
                description=f"Request rejected! ⚠️ Warning: Failed to send feedback to n8n.\nReason was: {reason}",
                color=discord.Color.dark_red()
            )
        
        await interaction.response.send_message(embed=embed)
        bot.current_approval = None

@bot.tree.command(name="status", description="Check the status of pending approval requests")
async def status_command(interaction: discord.Interaction):
    """Show status of pending approval requests"""
    async with bot.approval_lock:
        if bot.current_approval and bot.current_approval.is_active:
            embed = discord.Embed(
                title="📋 Active Approval Request",
                description="There is currently an active approval request",
                color=discord.Color.blue()
            )
            embed.add_field(
                name="Started", 
                value=bot.current_approval.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC'), 
                inline=True
            )
            embed.add_field(
                name="Webhook", 
                value=f"```{bot.current_approval.resume_webhook[:50]}{'...' if len(bot.current_approval.resume_webhook) > 50 else ''}```", 
                inline=False
            )
            embed.add_field(
                name="Available Actions", 
                value="Use `/accept` or `/reject <reason>` to respond", 
                inline=False
            )
            
            if bot.current_approval.request_data:
                request_content = bot.current_approval.request_data.get('request-content', {})
                if request_content:
                    content_text = json.dumps(request_content, indent=2)
                    if len(content_text) > 1024:
                        content_text = content_text[:1021] + "..."
                    embed.add_field(name="Request Details", value=f"```json\n{content_text}\n```", inline=False)
        else:
            embed = discord.Embed(
                title="📋 No Active Requests",
                description="No pending approval requests at this time",
                color=discord.Color.green()
            )
    
    await interaction.response.send_message(embed=embed, ephemeral=True)

async def main():
    """Main function to run the bot"""
    # Start the bot
    discord_token = os.getenv('DISCORD_BOT_TOKEN')
    if not discord_token:
        logger.error("DISCORD_BOT_TOKEN environment variable not set")
        return
    
    try:
        await bot.start(discord_token)
    except Exception as e:
        logger.error(f"Error starting bot: {e}")

if __name__ == '__main__':
    asyncio.run(main())