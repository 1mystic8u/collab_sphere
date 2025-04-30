

import { GoogleGenAI } from '@google/genai';
import aiConfig from '../config/aiConfig';

export default class AiService {
  constructor() {
    this.apiKey = aiConfig.getApiKey();
    this.genAI = this.apiKey ? new GoogleGenAI({ apiKey: this.apiKey }) : null;
    this.settings = aiConfig.settings;
  }

  /**
   * config
   * @returns {boolean} T/F 
   */
  isConfigured() {
    return !!this.genAI;
  }

  /**
   * Generate 
   * @param {string} prompt 
   * @param {Object} options 
   * @returns {Promise<string>} 
   */
  async generateContent(prompt, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not properly configured. Please check your API key.');
    }

    try {
      const model = this.genAI.models.generateContent({
        model: options.model || this.settings.defaultModel,
        contents: prompt,
        generationConfig: {
          temperature: options.temperature || this.settings.temperature,
          topK: options.topK || this.settings.topK,
          topP: options.topP || this.settings.topP,
          maxOutputTokens: options.maxOutputTokens || this.settings.maxOutputTokens,
        },
      });

      const result = await model;
      return result.text;
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw error;
    }
  }

  /**
   * insights
   * @param {Object} project 
   * @returns {Promise<string>} 
   */
  async generateProjectInsights(project) {
    const projectInfo = {
      title: project.title,
      description: project.description,
      skills: project.skills.join(', '),
      interestedCount: project.interested.length,
      discussionsCount: project.discussions.length,
      recentDiscussions: project.discussions.slice(-3).map(d => d.content).join('\n')
    };

    const prompt = `
    You are CollabHelper, an AI assistant for Collab-Sphere, a platform for students to collaborate on coding projects.
    
    Here's information about a project:
    Title: ${projectInfo.title}
    Description: ${projectInfo.description}
    Required Skills: ${projectInfo.skills}
    Interested Contributors: ${projectInfo.interestedCount}
    Number of Discussions: ${projectInfo.discussionsCount}
    
    ${projectInfo.recentDiscussions ? `Recent discussions: ${projectInfo.recentDiscussions}` : 'No discussions yet.'}
    
    Based on this information, please provide:
    1. A brief analysis of the project
    2. Concrete suggestions for how a new contributor could get started
    3. Tips for effective collaboration
    4. Potential first tasks that would be suitable for beginners
    
    Keep your response concise, friendly, and actionable. Focus on practical next steps.
    `;

    return this.generateContent(prompt);
  }

  /**
   * contribution guide 
   * @param {Object} githubData  GitHub 
   * @returns {Promise<string>}
   */
  async generateContributionGuide(githubData) {
    if (!githubData || !githubData.success) {
      throw new Error('Invalid GitHub data provided');
    }

    let prompt = `
    You are CollabHelper, an AI assistant that helps new contributors get started with GitHub projects.
    
    I need a personalized contribution guide for this repository:
    Repository: ${githubData.repoDetails.name}
    Description: ${githubData.repoDetails.description || 'No description provided'}
    Main Language: ${githubData.repoDetails.language || 'Not specified'}
    Topics: ${githubData.repoDetails.topics.join(', ') || 'None'}
    `;
    
    // Add README 
    if (githubData.readme && githubData.readme.content) {
      prompt += `
      README Content Summary:
      ${githubData.readme.content.substring(0, 1500)}
      `;
    }
    
    // Add CONTRIBUTING.md
    if (githubData.contributing && githubData.contributing.content) {
      prompt += `
      CONTRIBUTING.md Content Summary:
      ${githubData.contributing.content.substring(0, 1500)}
      `;
    }
    
    // Add beginner-friendly issues 
    if (githubData.beginnerIssues && githubData.beginnerIssues.length > 0) {
      prompt += `
      Beginner-Friendly Issues:
      ${githubData.beginnerIssues.map(issue => 
        `#${issue.number}: ${issue.title} (Labels: ${issue.labels.join(', ')})`
      ).join('\n')}
      `;
    }
    
    prompt += `
    Based on this information, create a clear, step-by-step guide for a new contributor who wants to contribute to this project. Include:
    
    1. Setup instructions (keep it concise, focus on the essential steps)
    2. Workflow for making contributions
    3. Suggested first tasks based on the beginner-friendly issues
    4. Tips for effective collaboration with the maintainers
    5. Any project-specific conventions or requirements
    
    Format this as a friendly, encouraging guide. Use markdown formatting to make it readable.
    Keep the total length under 800 words.
    `;

    return this.generateContent(prompt);
  }

  /**
   *  "vibe check"
   * @param {Object} project 
   * @returns {Promise<string>} 
   */
  async generateVibeCheck(project) {
    const discussions = project.discussions.map(d => d.content).join('\n\n');
    
    const prompt = `
    You are CollabHelper, an AI assistant for Collab-Sphere, a platform for students to collaborate on coding projects.
    
    Please analyze these project discussions and provide a "Vibe Check" - an assessment of the collaboration atmosphere:

    Project Title: ${project.title}
    
    Discussions:
    ${discussions || 'No discussions yet.'}
    
    Based on these discussions (or lack thereof), please:
    1. Provide a "Vibe Check" rating (Highly Collaborative, Moderately Collaborative, Needs More Activity, Just Starting, etc.)
    2. Give a brief explanation for this rating (2-3 sentences)
    3. Provide 1-2 specific suggestions to improve collaboration
    
    Keep your response concise and constructive. If there are no discussions yet, focus on how to kick-start positive collaboration.
    `;
    
    return this.generateContent(prompt);
  }

  /**
   * recommendations
   * @param {Object} project 
   * @param {Object} user 
   * @returns {Promise<string>} Skill matching recommendations
   */
  async generateSkillMatching(project, user) {
    const prompt = `
    You are CollabHelper, an AI assistant for Collab-Sphere, a platform for students to collaborate on coding projects.
    
    Please analyze the match between a user's skills and a project's requirements:
    
    Project Title: ${project.title}
    Project Description: ${project.description}
    Required Skills: ${project.skills.join(', ')}
    
    User Skills: ${user.skills.join(', ')}
    
    Based on this information, please:
    1. Assess how well the user's skills match the project requirements (Good match, Partial match, Limited match)
    2. Identify skills the user already has that are valuable for this project
    3. Suggest 1-2 additional skills the user could learn to better contribute to this project
    4. Recommend specific areas of the project where the user could contribute based on their current skills
    
    Keep your response concise and constructive.
    `;
    
    return this.generateContent(prompt);
  }

  /**
   *  custom question
   * @param {string} question
   * @param {Object} project 
   * @returns {Promise<string>} 
   */
  async answerProjectQuestion(question, project) {
    const prompt = `
    You are CollabHelper, an AI assistant for Collab-Sphere, a platform for students to collaborate on coding projects.
    
    Project Context:
    Title: ${project.title}
    Description: ${project.description}
    Required Skills: ${project.skills.join(', ')}
    
    User Question: "${question}"
    
    Please answer the question in a helpful, concise way based on the project context. If you don't have enough information to answer completely, acknowledge this and suggest what additional information might be needed.
    `;
    
    return this.generateContent(prompt);
  }
}