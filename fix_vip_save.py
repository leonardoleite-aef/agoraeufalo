import re

with open('admin-alunos.html', 'r') as f:
    content = f.read()

# Replace the broken save logic in handleSaveVipSpace
broken_save_block = """        if (window.aefCloudSync) {
          await window.aefCloudSync.init();
          await window.aefCloudSync.saveStudentCloud(studentPayload);
        }"""

fixed_save_block = """        if (window.aefPortalAuth) {
          await window.aefPortalAuth.ready();
          await window.aefPortalAuth.updateUserTierAndRole(studentId, 'vip_mentorship', 'student', studentPayload.enrolledProducts, studentPayload);
          await window.aefPortalAuth.saveMenteeDoc(studentId, studentPayload);
        }"""

if broken_save_block in content:
    content = content.replace(broken_save_block, fixed_save_block)
    print("Fixed saveStudentCloud logic!")
else:
    print("Could not find broken_save_block!")

with open('admin-alunos.html', 'w') as f:
    f.write(content)
