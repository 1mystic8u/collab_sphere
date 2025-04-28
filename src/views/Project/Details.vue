<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { auth, db } from '../../firebase'; // Assuming firebase config is here
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import Textarea from 'primevue/textarea';
// Removed InputText as it wasn't used


// ai pane component 
import AiAssistant from '../AiAssistant.vue';

const router = useRouter();
const route = useRoute();
const project = ref(null);
const loading = ref(true);
const isLoggedIn = ref(false);
const currentUser = ref(null); // Store current user details
const newDiscussion = ref('');
const commentLoading = ref(false);
const interestLoading = ref(false);

onMounted(async () => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    isLoggedIn.value = !!user;
    currentUser.value = user; // Store user object
    // Re-fetch or update computed properties if needed after login state changes
    if (project.value) {
       // Potentially refresh computed properties if they depend heavily on currentUser state beyond just isLoggedIn
    }
  });

  await fetchProjectDetails();

  // Cleanup listener on unmount
  // return () => unsubscribe(); // Vue 3 automatically handles this for onMounted async setup
});

const fetchProjectDetails = async () => {
  loading.value = true;
  try {
    const projectId = route.params.id;
    if (!projectId) {
        throw new Error("Project ID is missing from route parameters.");
    }
    const projectDocRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectDocRef);

    if (projectDoc.exists()) {
      const projectData = projectDoc.data();

      // Convert Firestore Timestamp to JavaScript Date for createdAt
      if (projectData.createdAt && projectData.createdAt.toDate) {
        projectData.createdAt = projectData.createdAt.toDate();
      } else {
        // Handle cases where createdAt might be missing or not a Timestamp
        projectData.createdAt = new Date(); // Default or handle appropriately
      }

      // Convert timestamps in discussions
      if (projectData.discussions && Array.isArray(projectData.discussions)) {
        projectData.discussions = projectData.discussions.map(discussion => {
          let createdAtDate = new Date(); // Default date
          if (discussion.createdAt && discussion.createdAt.toDate) {
             createdAtDate = discussion.createdAt.toDate();
          } else if (discussion.createdAt instanceof Date) {
             createdAtDate = discussion.createdAt; // Already a Date object
          }
          // Ensure user object exists
          const user = discussion.user || { displayName: 'Unknown User', uid: null };
          return {
            ...discussion,
            createdAt: createdAtDate,
            user: user
          };
        }).sort((a, b) => a.createdAt - b.createdAt); // Sort discussions chronologically
      } else {
        projectData.discussions = []; // Ensure discussions is always an array
      }

      // Ensure interested is always an array
      projectData.interested = projectData.interested || [];
      // Ensure createdBy exists
      projectData.createdBy = projectData.createdBy || { displayName: 'Unknown Creator', uid: null, email: 'N/A' };


      project.value = {
        id: projectDoc.id,
        ...projectData
      };
    } else {
      console.warn(`Project with ID ${projectId} not found.`);
      project.value = null;
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
    project.value = null; // Set project to null on error
  } finally {
    loading.value = false;
  }
};

// Computed property to check if the current user created the project
const isCreator = computed(() => {
  if (!project.value || !currentUser.value) return false;
  return project.value.createdBy?.uid === currentUser.value?.uid;
});

// Computed property to check if the current user has expressed interest
const hasExpressedInterest = computed(() => {
  if (!project.value || !currentUser.value) return false;
  // Ensure interested array exists before checking
  return project.value.interested?.some(user => user.uid === currentUser.value?.uid);
});

// Computed property to correctly split skills from Firestore data
const computedSkills = computed(() => {
  if (!project.value || !project.value.skills) return [];
  // Handle the case where skills is an array containing a single comma-separated string
  if (Array.isArray(project.value.skills) && project.value.skills.length > 0 && typeof project.value.skills[0] === 'string') {
    return project.value.skills[0].split(',').map(sk => sk.trim()).filter(Boolean);
  }
  // Handle if skills is just a single string (less likely based on data, but safe)
  if (typeof project.value.skills === 'string') {
     return project.value.skills.split(',').map(sk => sk.trim()).filter(Boolean);
  }
  // Handle if skills is already an array of individual strings
  if (Array.isArray(project.value.skills) && project.value.skills.every(s => typeof s === 'string')) {
      // If it might contain comma-separated strings within the array
      // return project.value.skills.flatMap(s => s.split(',').map(sk => sk.trim())).filter(Boolean);
      // If it's guaranteed to be individual skills per array element:
      return project.value.skills.filter(Boolean);
  }
  return []; // Default empty array
});


const expressInterest = async () => {
  if (!isLoggedIn.value || !currentUser.value) {
    router.push('/login'); // Redirect to login if not logged in
    return;
  }
  if (!project.value) return; // Don't proceed if project data isn't loaded

  interestLoading.value = true;
  try {
    const user = currentUser.value; // Use the stored user object
    const projectRef = doc(db, 'projects', project.value.id);

    const interestData = {
      uid: user.uid,
      displayName: user.displayName || user.email || 'Anonymous', // Fallback display name
      email: user.email || 'No Email Provided', // Store email
      photoURL: user.photoURL || null // Store photoURL if available
    };

    // Add user to project's interested array in Firestore
    await updateDoc(projectRef, {
      interested: arrayUnion(interestData)
    });

    // Optionally, update a user's profile with interested projects (if you have a 'users' collection)
    // const userRef = doc(db, 'users', user.uid);
    // await updateDoc(userRef, {
    //   interestedProjects: arrayUnion(project.value.id)
    // });

    // Update local state optimistically
    if (project.value.interested) {
        project.value.interested.push(interestData);
    } else {
        project.value.interested = [interestData];
    }


  } catch (error) {
    console.error('Error expressing interest:', error);
    // Optionally show an error message to the user
  } finally {
    interestLoading.value = false;
  }
};

const addDiscussion = async () => {
  if (!isLoggedIn.value || !currentUser.value || !newDiscussion.value.trim()) return;
  if (!project.value) return;

  commentLoading.value = true;
  try {
    const user = currentUser.value;
    const projectRef = doc(db, 'projects', project.value.id);

    const discussionData = {
      content: newDiscussion.value,
      createdAt: Timestamp.now(), // Use Firestore Timestamp for consistency
      user: {
        uid: user.uid,
        displayName: user.displayName || user.email || 'Anonymous',
        email: user.email || 'No Email Provided', // Include email
        photoURL: user.photoURL || null // Include photoURL
      }
    };

    // Add discussion to project in Firestore
    await updateDoc(projectRef, {
      discussions: arrayUnion(discussionData)
    });

    // Update local state optimistically
     // Convert Firestore Timestamp back to JS Date for local state consistency
    const discussionDataForLocalState = {
        ...discussionData,
        createdAt: discussionData.createdAt.toDate()
    };

    if (project.value.discussions) {
       project.value.discussions.push(discussionDataForLocalState);
    } else {
       project.value.discussions = [discussionDataForLocalState];
    }

    newDiscussion.value = ''; // Clear input field

  } catch (error) {
    console.error('Error adding discussion:', error);
     // Optionally show an error message to the user
  } finally {
    commentLoading.value = false;
  }
};

// Keep formatDate for discussion timestamps
const formatDate = (date) => {
  if (!date) return 'Date not available';
  // Ensure it's a JS Date object
  const jsDate = date instanceof Date ? date : (date && date.toDate ? date.toDate() : null);

  if (!jsDate) return 'Invalid Date';

  try {
      return jsDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
  } catch (e) {
      console.error("Error formatting date:", e, "Input date:", date);
      return 'Invalid Date';
  }
};

</script>

<template>
  <div class="outer_enclose">
    <div class="page-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Loading project details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="!project" class="error-state">
        <p>Project not found or could not be loaded.</p>
        <Button label="Back to Discover" @click="router.push('/discover')" />
      </div>

      <!-- Project Details -->
      <template v-else>
        <!-- Back Button -->
        <div class="back-button-container">
          <Button
            label="< Back to Dashboard"
            class="p-button-text p-button-sm back-button"
            @click="router.push('/dashboard')" />
            <!-- Assuming '/dashboard' is the correct route -->
        </div>

        <!-- Project Details Header Section -->
        <div class="project-details-header">
            <h2>Project Details</h2>
            <p class="creator-info">Created by: {{ project.createdBy.email || project.createdBy.displayName }}</p>
        </div>

        <!-- Interest Button -->
        <div class="interest-button-container">
            <Button
              v-if="isLoggedIn && !isCreator && !hasExpressedInterest"
              label="I'm Interested"
              icon="pi pi-heart"
              class="p-button-raised p-button-info interest-button"
              @click="expressInterest"
              :loading="interestLoading"
            />
            <Button
              v-else-if="isLoggedIn && !isCreator && hasExpressedInterest"
              label="Interested"
              icon="pi pi-check"
              class="p-button-raised p-button-success interest-button"
              disabled
            />
            <!-- Optionally show something for the creator, or hide the button -->
             <Button
              v-else-if="isLoggedIn && isCreator"
              label="My Project"
              icon="pi pi-user"
              class="p-button-raised p-button-secondary interest-button"
              disabled
            />
        </div>


        <!-- Description -->
        <p class="project-description">
            {{ project.description }}
        </p>

        <!-- Required Skills -->
        <div class="skills-section">
            <h3>Required Skills</h3>
            <div class="skills-container">
            <Chip v-for="skill in computedSkills" :key="skill" :label="skill" class="skill-chip" />
            <span v-if="computedSkills.length === 0">No specific skills listed.</span>
            </div>
        </div>

        <!-- Interested Students Summary -->
        <div class="interested-summary p-card p-component">
             <i class="pi pi-users icon"></i>
             <div class="summary-text">
                <span class="summary-title">Interested Students</span>
                <p class="summary-count">{{ project.interested?.length || 0 }} students are interested</p>
             </div>
        </div>

        <!-- Interested Students List -->
        <div class="interested-list" v-if="project.interested && project.interested.length > 0">
            <div v-for="user in project.interested" :key="user.uid" class="interested-user-item">
                <Avatar :image="user.photoURL" icon="pi pi-user" shape="circle" size="large" />
                <div class="user-info">
                    <div class="user-name">{{ user.displayName }}</div>
                    <div class="user-email">{{ user.email }}</div>
                </div>
            </div>
        </div>
         <div v-else class="interested-list-empty">
             <p>Be the first to show interest!</p>
         </div>

        <!-- Discussion Section -->
        <div class="discussion-section p-card p-component">
            <div class="discussion-header">
                <i class="pi pi-comments icon"></i>
                <h3 class="discussion-title">Discussion</h3>
            </div>

            <!-- Existing Discussions -->
            <div v-if="project.discussions && project.discussions.length > 0" class="discussions-list">
                <div v-for="(discussion, index) in project.discussions" :key="index" class="discussion-item">
                    <div class="discussion-item-header">
                        <Avatar :image="discussion.user?.photoURL" icon="pi pi-user" shape="circle" size="normal" />
                        <div class="discussion-user-details">
                            <span class="discussion-user-name">{{ discussion.user?.displayName || 'Unknown User' }}</span>
                            <span class="discussion-time">{{ formatDate(discussion.createdAt) }}</span>
                        </div>
                    </div>
                    <p class="discussion-content">{{ discussion.content }}</p>
                </div>
            </div>
            <div v-else class="no-discussions">
                <p>No discussions yet. Start the conversation!</p>
            </div>

            <!-- Add Comment Area -->
            <div v-if="isLoggedIn" class="add-discussion-area">
                <Textarea
                    v-model="newDiscussion"
                    rows="3"
                    placeholder="Add a comment..."
                    class="w-full comment-textarea"
                    autoResize
                />
                 <Button
                    label="Post Comment"
                    icon="pi pi-send"
                    class="p-button-sm post-comment-button"
                    @click="addDiscussion"
                    :disabled="!newDiscussion.trim()"
                    :loading="commentLoading"
                 />
            </div>
            <div v-else class="login-prompt">
                 <p>Please <router-link to="/login">login</router-link> or <router-link to="/register">sign up</router-link> to join the discussion.</p>
            </div>
        </div>

        
      </template>

     

    </div>


    <div class="ai_pane">     
     <AiAssistant :project="project" v-if="isLoggedIn" />
    </div>
  </div>

    

</template>

<style scoped>

.outer_enclose {
  display: grid;
  grid-template-columns: 4fr 1fr; /* Single column layout */
 
}

.ai_pane{
  max-width: 15wv;
}

.page-container {
  max-width: 900px; /* Or your preferred max width */
  margin: 1rem ;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Spacing between sections */
}


.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.back-button-container {
    margin-bottom: 0.5rem; /* Less space below back button */
}

.back-button.p-button-text {
    padding: 0.25rem 0.5rem;
    color: #007bff; /* Standard link color */
    font-weight: normal;
}
.back-button .pi {
    margin-right: 0.25rem;
}

.project-details-header {
    margin-bottom: 0.5rem;
}

.project-details-header h2 {
    margin-bottom: 0.25rem;
    font-size: 1.8rem; /* Slightly larger title */
    font-weight: bold;
}

.creator-info {
    color: #6b7280; /* Gray text */
    font-size: 0.9rem;
    margin-bottom: 1rem; /* Space before description */
}

/* Position Interest Button - Adjust as needed */
.interest-button-container {
    margin-top: -60px; /* Pull button up */
    display: flex;
    justify-content: flex-end; /* Align button to the right */
    margin-bottom: 1rem; /* Space below button */
}

.interest-button {
    min-width: 150px; /* Give button some width */
}


.project-description {
  line-height: 1.6;
  margin-bottom: 1.5rem; /* Space below description */
  color: #333;
}

.skills-section h3,
.discussion-section h3 {
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skill-chip {
  background-color: #e9ecef;
  color: #495057;
  font-size: 0.85rem;
}

/* Interested Students Summary Box */
.interested-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: #e0f7fa; /* Light cyan background like mockup */
    border: 1px solid #b2ebf2;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem; /* Space before the list */
}

.interested-summary .icon {
    font-size: 2rem;
    color: #0097a7; /* Darker cyan */
}
.interested-summary .summary-text {
    flex-grow: 1;
}
.interested-summary .summary-title {
    font-weight: bold;
    font-size: 1.1rem;
    display: block; /* Ensures title is on its own line */
    margin-bottom: 0.25rem;
}
.interested-summary .summary-count {
    color: #555;
    margin: 0; /* Reset paragraph margin */
    font-size: 0.9rem;
}


/* Interested Students List */
.interested-list {
    display: grid;
    /* grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); */
    grid-template-columns: repeat(3, 1fr); /* Fixed 3 columns */
    gap: 1.5rem; /* Space between user items */
    margin-bottom: 1.5rem; /* Space below list */
}

.interested-list-empty {
    color: #6c757d;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 6px;
    text-align: center;
}

.interested-user-item {
    display: flex;
    align-items: center;
    gap: 0.75rem; /* Space between avatar and text */
    background-color: #fff; /* Optional: background for each item */
    padding: 0.75rem; /* Optional: padding */
    border-radius: 6px; /* Optional: rounded corners */
    box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Optional: subtle shadow */
}

.interested-user-item .user-info {
    display: flex;
    flex-direction: column;
}

.interested-user-item .user-name {
    font-weight: 600;
    font-size: 0.95rem;
}

.interested-user-item .user-email {
    font-size: 0.85rem;
    color: #6c757d; /* Gray text for email */
    word-break: break-all; /* Prevent long emails overflowing */
}

/* Discussion Section Card */
.discussion-section {
    background-color: #e0f7fa; /* Same background as interested summary */
    border: 1px solid #b2ebf2;
    border-radius: 8px;
    padding: 1.5rem;
}

.discussion-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}
.discussion-header .icon {
    font-size: 1.8rem;
    color: #0097a7;
}
.discussion-header .discussion-title {
    margin: 0; /* Reset heading margin */
     font-size: 1.2rem;
     font-weight: 600;
}

/* Discussion List Styling */
.discussions-list {
    margin-bottom: 1.5rem; /* Space before add comment area */
    display: flex;
    flex-direction: column;
    gap: 1.5rem; /* Space between discussion items */
}

.no-discussions, .login-prompt {
    color: #6c757d;
    padding: 1rem 0;
    text-align: center;
}
.login-prompt a {
    color: #007bff;
    text-decoration: none;
}
.login-prompt a:hover {
    text-decoration: underline;
}


.discussion-item {
    background-color: #fff; /* White background for each comment */
    padding: 1rem;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.discussion-item-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}
.discussion-user-details {
    display: flex;
    flex-direction: column;
}
.discussion-user-name {
    font-weight: 600;
    font-size: 0.9rem;
}
.discussion-time {
    font-size: 0.8rem;
    color: #6c757d;
}

.discussion-content {
    margin: 0.5rem 0 0 0; /* Adjust margin as needed */
    font-size: 0.95rem;
    line-height: 1.5;
    color: #333;
     white-space: pre-wrap; /* Preserve line breaks */
     word-wrap: break-word; /* Break long words */
}


/* Add Comment Area */
.add-discussion-area {
    display: flex;
    flex-direction: column; /* Stack textarea and button */
    gap: 0.5rem; /* Space between textarea and button */
    margin-top: 1rem;
    border-top: 1px solid #dee2e6; /* Separator line */
    padding-top: 1rem;
}

.comment-textarea {
    font-size: 0.95rem; /* Make textarea text slightly larger */
    border-radius: 6px;
}
.comment-textarea::placeholder {
  color: #999; /* Lighter placeholder text */
}

.post-comment-button {
    align-self: flex-end; /* Align button to the right */
}

/* Ensure PrimeVue Card default padding/margin don't interfere too much */
:deep(.p-card .p-card-content) {
    padding: 0; /* Remove default card content padding if sections handle it */
}
:deep(.p-card .p-card-body) {
    padding: 1rem; /* Adjust body padding if needed */
}

/* Responsive adjustments if necessary */
@media (max-width: 768px) {
    .interested-list {
        grid-template-columns: repeat(2, 1fr); /* 2 columns on smaller screens */
    }
    .interest-button-container {
        margin-top: 1rem; /* Reset negative margin */
        justify-content: flex-start; /* Align left on small screens */
        margin-bottom: 1rem;
    }
}
@media (max-width: 576px) {
     .interested-list {
        grid-template-columns: 1fr; /* 1 column on very small screens */
    }
    .project-details-header h2 {
        font-size: 1.5rem;
    }
}


</style>