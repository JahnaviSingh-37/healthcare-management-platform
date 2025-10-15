#!/bin/bash

# 🚀 Push Healthcare Platform to GitHub
# Author: JahnaviSingh-37
# Date: October 16, 2025

echo "🏥 Healthcare Management Platform - GitHub Push"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Git repository not initialized!"
    echo "   Run: git init"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes!"
    echo ""
    read -p "   Commit them now? (y/n): " commit_choice
    if [ "$commit_choice" = "y" ]; then
        read -p "   Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed!"
    else
        echo "❌ Aborted. Please commit your changes first."
        exit 1
    fi
fi

echo ""
echo "📊 Current Status:"
echo "   Total commits: $(git rev-list --count HEAD)"
echo "   Current branch: $(git branch --show-current)"
echo ""

# Set up remote
echo "🔗 Setting up GitHub remote..."
if git remote | grep -q "origin"; then
    echo "   Remote 'origin' already exists"
    current_url=$(git remote get-url origin)
    echo "   Current URL: $current_url"
    echo ""
    read -p "   Update remote URL? (y/n): " update_choice
    if [ "$update_choice" = "y" ]; then
        git remote remove origin
        git remote add origin https://github.com/JahnaviSingh-37/healthcare-management-platform.git
        echo "✅ Remote updated!"
    fi
else
    git remote add origin https://github.com/JahnaviSingh-37/healthcare-management-platform.git
    echo "✅ Remote added: https://github.com/JahnaviSingh-37/healthcare-management-platform"
fi

echo ""
echo "🌿 Renaming branch to 'main'..."
git branch -M main
echo "✅ Branch renamed to 'main'"

echo ""
echo "🚀 Ready to push to GitHub!"
echo ""
echo "⚠️  IMPORTANT: You'll need to authenticate"
echo "   Option 1: Use Personal Access Token (recommended)"
echo "   Option 2: Use GitHub CLI (gh auth login)"
echo ""
read -p "   Push now? (y/n): " push_choice

if [ "$push_choice" = "y" ]; then
    echo ""
    echo "📤 Pushing to GitHub..."
    echo ""
    
    if git push -u origin main; then
        echo ""
        echo "🎉 SUCCESS! Your code is now on GitHub!"
        echo ""
        echo "🔗 View your repository:"
        echo "   https://github.com/JahnaviSingh-37/healthcare-management-platform"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Add a nice description on GitHub"
        echo "   2. Add topics: healthcare, react, nodejs, mongodb"
        echo "   3. Upload screenshots to README"
        echo "   4. Star your own repo ⭐"
        echo ""
        echo "✨ Your project looks professional! Great work!"
    else
        echo ""
        echo "❌ Push failed!"
        echo ""
        echo "💡 Common solutions:"
        echo ""
        echo "1️⃣  Authentication Required:"
        echo "   Create Personal Access Token at:"
        echo "   https://github.com/settings/tokens"
        echo "   Then use token as password"
        echo ""
        echo "2️⃣  Repository doesn't exist:"
        echo "   Create it at: https://github.com/new"
        echo "   Name: healthcare-management-platform"
        echo "   DON'T initialize with README"
        echo ""
        echo "3️⃣  Try GitHub CLI:"
        echo "   brew install gh"
        echo "   gh auth login"
        echo "   Then run this script again"
        echo ""
    fi
else
    echo ""
    echo "ℹ️  Push cancelled. Run this script when ready:"
    echo "   bash push-to-github.sh"
    echo ""
fi
