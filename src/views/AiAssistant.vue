<script setup>
import { ref, onMounted, watch } from 'vue';
import { GoogleGenAI } from '@google/genai';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Textarea from 'primevue/textarea';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import GitHubService from '@/services/githubService.js';

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const aiResponse = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const showAIPanel = ref(false);
const customPrompt = ref('');
const githubUrl = ref('');
const githubData = ref(null);
const githubLoading = ref(false);
const githubError = ref('');
const activeTab = ref(0);
const contributionGuide = ref('');

const githubService = new GitHubService();
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY });


const formatAIResponseToHTML = (text) =>{
  if (!text || typeof text !== 'string') {
    return ''; 
  }

  let html = text;

  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/gs, (match, lang, code) => {
    const languageClass = lang ? ` class="language-${lang.trim()}"` : '';
    // Basic escaping for code content display within HTML
    const escapedCode = code
        .replace(/&/g, '&') // Must be first
        .replace(/</g, '<')
        .replace(/>/g, '>');
    return `<pre><code${languageClass}>${escapedCode.trim()}</code></pre>`;
  });

// 4. Inline Code (`...`) - Process before bold/italic to avoid conflict
  // Use non-greedy match. Need to be careful not to match across ``` blocks if they somehow remain.
  html = html.replace(/`([^`]+?)`/g, (match, code) => {
    // Escape HTML within inline code
    const escapedCode = code
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>');
    return `<code>${escapedCode}</code>`;
   });  




   html = html.replace(/```(?:\w+)?\n([\s\S]*?)\n```/g, (match, code) => {
  // Escape HTML entities inside the code
  const escapedCode = code
    .replace(/&/g, '&amp;') 
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  return `<pre><code>${escapedCode.trim()}</code></pre>`;
});

  // 2b. Heading 3 (### ...)
  // Needs 'gm' flags for multiline matching (^) and global replacement.
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  // 2. Headings (## ...)
  // Needs 'gm' flags for multiline matching (^) and global replacement.
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');


    //5. Extra Bold (****...****) - Process before regular bold
  // Use non-greedy match. Applying inline style for stronger emphasis.
  html = html.replace(/\*\*\*\*(.*?)\*\*\*\*/g, '<strong style="font-weight: 900;">$1</strong>');

  // 3. Bold (**...**)
  // Replace bold after headings and code blocks. Use non-greedy match (.*?).
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 4. Italic (*...*)
  // Replace italic after bold to prevent conflicts (e.g., matching inside **).
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');





  // 5. Optional: Convert remaining standalone newlines to <br> tags
  // Be careful if the AI might intentionally use newlines within paragraphs
  // that shouldn't be <br>s. This also won't add <p> tags.
  // It also might incorrectly add <br> if the regexes above leave trailing/leading newlines.
  // Consider if you really need this step or if CSS white-space: pre-wrap is enough.
  // html = html.split('\n').map(line => line.trim() === '' ? '' : `<p>${line}</p>`).join(''); // Basic paragraph attempt
  // Or simpler <br> conversion:
  // html = html.replace(/\n/g, '<br>\n'); // Add <br> but be careful with <pre>

  return html.trim(); // Trim final whitespace
};


const generateAISuggestions = async () => {
  if (!props.project) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const projectInfo = {
      title: props.project.title,
      description: props.project.description,
      skills: props.project.skills,
      interestedCount: props.project.interested.length,
      discussionsCount: props.project.discussions.length,
      recentDiscussions: props.project.discussions.slice(-3).map(d => d.content)
    };
    
    const prompt = `
    You are CollabHelper, an AI assistant for Collab-Sphere, a platform for students to collaborate on coding projects.
    
    Here's information about a project:
    Title: ${projectInfo.title}
    Description: ${projectInfo.description}
    Required Skills: ${projectInfo.skills.join(', ')}
    Interested Contributors: ${projectInfo.interestedCount}
    Number of Discussions: ${projectInfo.discussionsCount}
    
    ${projectInfo.recentDiscussions.length > 0 ? 
      `Recent discussions: 
      ${projectInfo.recentDiscussions.join('\n')}` : 
      'No discussions yet.'}
    
    Based on this information, please provide:
    1. A brief analysis of the project
    2. Concrete suggestions for how a new contributor could get started
    3. Tips for effective collaboration
    4. Potential first tasks that would be suitable for beginners
    
    Keep your response concise, friendly, and actionable. Focus on practical next steps. Use markdown formatting.
    `;
    
    const model = genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: customPrompt.value || prompt,
    });
    
    const result = await model;
    aiResponse.value = formatAIResponseToHTML(result.text);
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    errorMessage.value = `Failed to generate suggestions: ${error.message}`;
    aiResponse.value = 'Sorry, I encountered an error while analyzing this project. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

const fetchGitHubData = async () => {
  if (!githubUrl.value) {
    githubError.value = 'Please enter a GitHub repository URL';
    return;
  }
  
  githubLoading.value = true;
  githubError.value = '';
  githubData.value = null;
  
  try {
    const data = await githubService.getProjectContextForAI(githubUrl.value);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch GitHub data');
    }
    
    githubData.value = data;
    
    await generateContributionGuide(data);
    
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    githubError.value = error.message;
  } finally {
    githubLoading.value = false;
  }
};

const generateContributionGuide = async (githubData) => {
  if (!githubData || !githubData.success) return;
  
  isLoading.value = true;
  
  try {
    let prompt = `
    You are CollabHelper, an AI assistant that helps new contributors get started with GitHub projects.
    
    I need a personalized contribution guide for this repository:
    Repository: ${githubData.repoDetails.name}
    Description: ${githubData.repoDetails.description || 'No description provided'}
    Main Language: ${githubData.repoDetails.language || 'Not specified'}
    Topics: ${githubData.repoDetails.topics.join(', ') || 'None'}
    `;
    
    if (githubData.readme && githubData.readme.content) {
      prompt += `
      README Content Summary:
      ${githubData.readme.content.substring(0, 1500)}
      `;
    }
    
    if (githubData.contributing && githubData.contributing.content) {
      prompt += `
      CONTRIBUTING.md Content Summary:
      ${githubData.contributing.content.substring(0, 1500)}
      `;
    }
    
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
    
    const model = genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const result = await model;

    contributionGuide.value = formatAIResponseToHTML(result.text);
   
    
    activeTab.value = 1;
    
  } catch (error) {
    console.error('Error generating contribution guide:', error);
    contributionGuide.value = 'Sorry, I encountered an error while generating the contribution guide. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

const generateVibeCheck = async () => {
  if (!props.project) return;
  
  isLoading.value = true;
  
  try {
    const discussions = props.project.discussions.map(d => d.content).join('\n\n');
    
    const prompt = `
    You are CollabHelper, an AI assistant for Collab-Sphere, a platform for students to collaborate on coding projects.
    
    Please analyze these project discussions and provide a "Vibe Check" - an assessment of the collaboration atmosphere:

    Project Title: ${props.project.title}
    
    Discussions:
    ${discussions || 'No discussions yet.'}
    
    Based on these discussions (or lack thereof), please:
    1. Provide a "Vibe Check" rating (Highly Collaborative, Moderately Collaborative, Needs More Activity, Just Starting, etc.)
    2. Give a brief explanation for this rating (2-3 sentences)
    3. Provide 1-2 specific suggestions to improve collaboration
    
    Keep your response concise and constructive. If there are no discussions yet, focus on how to kick-start positive collaboration.
    `;
    
    const model = genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const result = await model;
    return formatAIResponseToHTML(result.text);
    
  } catch (error) {
    console.error('Error generating vibe check:', error);
    return 'Error generating vibe check. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Watch for changes to the project
watch(() => props.project, (newProject) => {
  if (newProject && showAIPanel.value) {
    generateAISuggestions();
  }
}, { deep: true });

// Toggle AI panel visibility
const toggleAIPanel = () => {
  showAIPanel.value = !showAIPanel.value;
  if (showAIPanel.value && !aiResponse.value) {
    generateAISuggestions();
  }
};

// Handle custom prompt submission
const submitCustomPrompt = () => {
  if (customPrompt.value.trim()) {
    generateAISuggestions();
  }
};
</script>

<template>
  <div class="ai-assistant-container">
    <Button 
      @click="toggleAIPanel" 
      :label="showAIPanel ? 'Hide AI Assistant' : 'Show AI Assistant'" 
      :icon="showAIPanel ? 'pi pi-eye-slash' : 'pi pi-lightbulb'" 
      class="p-button-rounded p-button-info ai-toggle-button"
    />
    
    <div v-if="showAIPanel" class="ai-panel">
      <Card>
        <template #header>
          <div class="ai-panel-header">
            <h3><i class="pi pi-lightbulb"></i> AI Project Assistant</h3>
          </div>
        </template>
        
        <template #content>
          <TabView v-model:activeIndex="activeTab">
            <TabPanel header="Project Insights">
              <div v-if="isLoading" class="ai-loading">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                <p>Analyzing project and generating suggestions...</p>
              </div>
              
              <div v-else-if="errorMessage" class="ai-error">
                <p>{{ errorMessage }}</p>
                <Button 
                  label="Try Again" 
                  icon="pi pi-refresh" 
                  @click="generateAISuggestions" 
                  class="p-button-sm"
                />
              </div>
              
              <div v-else-if="aiResponse" class="ai-response">
                <div v-html="aiResponse.replace(/\n/g, '<br>')"></div>
                
                <div class="ai-actions">
                  <Button 
                    label="Refresh Suggestions" 
                    icon="pi pi-refresh" 
                    @click="generateAISuggestions" 
                    class="p-button-sm"
                  />
                </div>
              </div>
              
              <div class="custom-prompt-section">
                <h4>Ask a specific question about this project</h4>
                <Textarea 
                  v-model="customPrompt" 
                  rows="2" 
                  placeholder="E.g., What specific skills should I focus on to contribute?" 
                  style="width: 100%;"
                  class="mb-2"
                />
                <br>
                <Button 
                  label="Ask" 
                  icon="pi pi-send" 
                  @click="submitCustomPrompt" 
                  :disabled="!customPrompt.trim() || isLoading" 
                  class="p-button-sm"
                />
              </div>
            </TabPanel>
            
            <TabPanel header="Contribution Guide">
              <div class="github-integration">
                <h4>Generate a Custom Contribution Guide</h4>
                <p>Enter the GitHub repository URL for this project to get a personalized contribution guide:</p>
                
                <div class="github-input">
                  <InputText 
                    v-model="githubUrl" 
                    placeholder="https://github.com/username/repository" 
                    class="w-full mb-2"
                  />
                  <Button 
                    label="Analyze Repository" 
                    icon="pi pi-github" 
                    @click="fetchGitHubData" 
                    :loading="githubLoading" 
                    :disabled="!githubUrl.trim()"
                  />
                </div>
                
                <div v-if="githubError" class="github-error mt-2">
                  <p>{{ githubError }}</p>
                </div>
                
                <div v-if="githubLoading" class="ai-loading mt-4">
                  <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                  <p>Fetching repository data and generating contribution guide...</p>
                </div>
                
                <div v-else-if="contributionGuide" class="contribution-guide mt-4">
                  <div v-html="contributionGuide.replace(/\n/g, '<br>')"></div>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel header="Vibe Check">
              <div class="vibe-check-section">
                <h4>Project Collaboration Vibe Check</h4>
                <p>Get an AI assessment of the collaboration atmosphere in this project:</p>
                
                <Button 
                  label="Generate Vibe Check" 
                  icon="pi pi-heart" 
                  @click="async () => { 
                    const vibeCheck = await generateVibeCheck(); 
                    $refs.vibeCheckResult.innerHTML = vibeCheck.replace(/\n/g, '<br>');
                  }" 
                  :loading="isLoading"
                  class="mb-4"
                />
                
                <div ref="vibeCheckResult" class="vibe-check-result mt-2">
                  <p class="placeholder-text">Click 'Generate Vibe Check' to analyze the project's collaboration atmosphere.</p>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.ai-assistant-container {
  margin-top: 2rem;
}

.ai-toggle-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 999;
}

.ai-panel {
  margin-top: 1rem;
  animation: slideIn 0.3s ease-out;
}

.ai-panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-loading, .ai-error, .github-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.github-error {
  color: #ef4444;
}

.ai-response, .contribution-guide, .vibe-check-result {
  line-height: 1.6;
  white-space: pre-line;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.ai-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.custom-prompt-section, .github-integration, .vibe-check-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.github-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.placeholder-text {
  color: #6b7280;
  font-style: italic;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>