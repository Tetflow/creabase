"""
Social Media Verification Module
Handles OAuth flows for Instagram and YouTube account verification
"""

import os
import secrets
import requests
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class InstagramOAuthHandler:
    """Handle Instagram OAuth authentication and verification"""
    
    def __init__(self):
        self.app_id = os.getenv('INSTAGRAM_APP_ID', '')
        self.app_secret = os.getenv('INSTAGRAM_APP_SECRET', '')
        self.redirect_uri = os.getenv('INSTAGRAM_REDIRECT_URI', '')
        self.base_url = "https://api.instagram.com"
        self.graph_url = "https://graph.instagram.com"
        self.api_version = "v21.0"
    
    def is_configured(self) -> bool:
        """Check if Instagram OAuth credentials are configured"""
        return bool(self.app_id and self.app_secret and self.redirect_uri)
    
    def get_authorization_url(self, state: str) -> str:
        """Generate Instagram OAuth authorization URL"""
        if not self.is_configured():
            raise ValueError("Instagram OAuth credentials not configured. Please add INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, and INSTAGRAM_REDIRECT_URI to .env file")
        
        scopes = "instagram_basic,instagram_manage_insights"
        auth_url = (
            f"{self.base_url}/oauth/authorize?"
            f"client_id={self.app_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope={scopes}&"
            f"response_type=code&"
            f"state={state}"
        )
        return auth_url
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        if not self.is_configured():
            raise ValueError("Instagram OAuth credentials not configured")
        
        token_url = f"{self.base_url}/oauth/access_token"
        
        payload = {
            "client_id": self.app_id,
            "client_secret": self.app_secret,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri,
            "code": code
        }
        
        try:
            response = requests.post(token_url, data=payload, timeout=10)
            response.raise_for_status()
            token_data = response.json()
            
            logger.info("Successfully exchanged Instagram code for access token")
            return token_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to exchange Instagram code: {str(e)}")
            raise
    
    async def get_long_lived_token(self, short_lived_token: str) -> Dict[str, Any]:
        """Convert short-lived token to long-lived token (60 days)"""
        url = f"{self.graph_url}/access_token"
        
        params = {
            "grant_type": "ig_exchange_token",
            "client_secret": self.app_secret,
            "access_token": short_lived_token
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            token_data = response.json()
            
            logger.info("Successfully obtained long-lived Instagram access token")
            return token_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get long-lived Instagram token: {str(e)}")
            raise
    
    async def get_user_profile(self, access_token: str) -> Dict[str, Any]:
        """Fetch Instagram user profile and follower count"""
        url = f"{self.graph_url}/{self.api_version}/me"
        
        params = {
            "fields": "id,username,account_type,media_count",
            "access_token": access_token
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            user_data = response.json()
            
            # For business/creator accounts, get follower count
            if user_data.get("account_type") in ["BUSINESS", "CREATOR"]:
                user_id = user_data.get("id")
                insights_url = f"{self.graph_url}/{self.api_version}/{user_id}"
                insights_params = {
                    "fields": "followers_count,follows_count",
                    "access_token": access_token
                }
                
                insights_response = requests.get(insights_url, params=insights_params, timeout=10)
                insights_response.raise_for_status()
                insights_data = insights_response.json()
                
                user_data.update(insights_data)
            
            logger.info(f"Retrieved Instagram profile for: {user_data.get('username')}")
            return user_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch Instagram user profile: {str(e)}")
            raise


class YouTubeOAuthHandler:
    """Handle YouTube OAuth authentication and verification"""
    
    def __init__(self):
        self.client_id = os.getenv('YOUTUBE_CLIENT_ID', '')
        self.client_secret = os.getenv('YOUTUBE_CLIENT_SECRET', '')
        self.redirect_uri = os.getenv('YOUTUBE_REDIRECT_URI', '')
        self.api_key = os.getenv('YOUTUBE_API_KEY', '')
        self.auth_uri = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_uri = "https://oauth2.googleapis.com/token"
        self.api_base = "https://www.googleapis.com/youtube/v3"
    
    def is_configured(self) -> bool:
        """Check if YouTube OAuth credentials are configured"""
        return bool(self.client_id and self.client_secret and self.redirect_uri)
    
    def get_authorization_url(self, state: str) -> str:
        """Generate YouTube OAuth authorization URL"""
        if not self.is_configured():
            raise ValueError("YouTube OAuth credentials not configured. Please add YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REDIRECT_URI to .env file")
        
        scopes = "https://www.googleapis.com/auth/youtube.readonly"
        auth_url = (
            f"{self.auth_uri}?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
            f"scope={scopes}&"
            f"access_type=offline&"
            f"state={state}"
        )
        return auth_url
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        if not self.is_configured():
            raise ValueError("YouTube OAuth credentials not configured")
        
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri
        }
        
        try:
            response = requests.post(self.token_uri, data=payload, timeout=10)
            response.raise_for_status()
            token_data = response.json()
            
            logger.info("Successfully exchanged YouTube code for access token")
            return token_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to exchange YouTube code: {str(e)}")
            raise
    
    async def get_channel_info(self, access_token: str) -> Dict[str, Any]:
        """Fetch YouTube channel information and subscriber count"""
        url = f"{self.api_base}/channels"
        
        params = {
            "part": "snippet,statistics",
            "mine": "true"
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if not data.get("items"):
                raise ValueError("No YouTube channel found for this account")
            
            channel = data["items"][0]
            channel_info = {
                "channel_id": channel["id"],
                "channel_title": channel["snippet"]["title"],
                "subscriber_count": int(channel["statistics"].get("subscriberCount", 0)),
                "video_count": int(channel["statistics"].get("videoCount", 0)),
                "view_count": int(channel["statistics"].get("viewCount", 0)),
                "custom_url": channel["snippet"].get("customUrl", ""),
                "thumbnail_url": channel["snippet"]["thumbnails"]["default"]["url"]
            }
            
            logger.info(f"Retrieved YouTube channel: {channel_info['channel_title']}")
            return channel_info
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch YouTube channel info: {str(e)}")
            raise
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh YouTube access token using refresh token"""
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        
        try:
            response = requests.post(self.token_uri, data=payload, timeout=10)
            response.raise_for_status()
            token_data = response.json()
            
            logger.info("Successfully refreshed YouTube access token")
            return token_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to refresh YouTube token: {str(e)}")
            raise


# Singleton instances
instagram_oauth = InstagramOAuthHandler()
youtube_oauth = YouTubeOAuthHandler()
