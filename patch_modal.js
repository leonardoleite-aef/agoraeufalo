const fs = require('fs');
let content = fs.readFileSync('admin-alunos.html', 'utf8');

const oldFunc = `    function openEditStudentModal(email) {
      const student = ALL_STUDENTS_LIST.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (!student) return;
      const AE = window.AEFAccessEngine;

      document.getElementById('edit-student-id').value = student.id || student.uid || '';
      document.getElementById('edit-student-name').value = student.name || '';
      document.getElementById('edit-student-email').value = student.email || '';
      
      // Set category checkboxes
      const cats = AE ? AE.resolveUserCategories(student) : ['member_free'];
      document.querySelectorAll('#edit-student-categories input[name="edit-cat"]').forEach(chk => {
        chk.checked = cats.includes(chk.value);
      });

      // Show/hide billing period and set value
      const hasPago = cats.includes('member_pago');
      const billingRow = document.getElementById('edit-billing-period-row');
      if (billingRow) billingRow.classList.toggle('hidden', !hasPago);
      const bp = student.subscription?.billingPeriod || (AE ? AE.migrateTierToBillingPeriod(student.tier) : 'annual');
      if (bp) document.getElementById('edit-billing-period').value = bp;

      // Admin toggle
      const isAdminUser = AE ? AE.isAdmin(student) : false;
      document.getElementById('edit-is-admin').checked = isAdminUser;
      document.getElementById('edit-student-role').value = student.role || (isAdminUser ? 'admin' : 'student');

      // Purchased products
      const purchased = student.purchasedProducts || student.enrolledProducts || [];
      document.querySelectorAll('#edit-purchased-products input[name="edit-purchased"]').forEach(chk => {
        chk.checked = purchased.includes(chk.value);
      });

      document.getElementById('edit-student-modal').classList.remove('hidden');
    }`;

const newFunc = `    let ALL_AVAILABLE_COURSES_CACHE = null;

    async function openEditStudentModal(email) {
      const student = ALL_STUDENTS_LIST.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (!student) return;
      const AE = window.AEFAccessEngine;

      document.getElementById('edit-student-id').value = student.id || student.uid || '';
      document.getElementById('edit-student-name').value = student.name || '';
      document.getElementById('edit-student-email').value = student.email || '';
      
      // Set category checkboxes
      const cats = AE ? AE.resolveUserCategories(student) : ['member_free'];
      document.querySelectorAll('#edit-student-categories input[name="edit-cat"]').forEach(chk => {
        chk.checked = cats.includes(chk.value);
      });

      // Show/hide billing period and set value
      const hasPago = cats.includes('member_pago');
      const billingRow = document.getElementById('edit-billing-period-row');
      if (billingRow) billingRow.classList.toggle('hidden', !hasPago);
      const bp = student.subscription?.billingPeriod || (AE ? AE.migrateTierToBillingPeriod(student.tier) : 'annual');
      if (bp) document.getElementById('edit-billing-period').value = bp;

      // Admin toggle
      const isAdminUser = AE ? AE.isAdmin(student) : false;
      document.getElementById('edit-is-admin').checked = isAdminUser;
      document.getElementById('edit-student-role').value = student.role || (isAdminUser ? 'admin' : 'student');

      // Load dynamic courses if not loaded
      if (!ALL_AVAILABLE_COURSES_CACHE) {
         try {
           const res = await fetch('https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses?pageSize=100');
           const data = await res.json();
           ALL_AVAILABLE_COURSES_CACHE = (data.documents || []).map(doc => {
             const f = doc.fields || {};
             return {
               id: doc.name.split('/').pop(),
               title: f.title?.stringValue || 'Sem Título',
               accessTier: f.accessTier?.stringValue || 'standalone'
             };
           }).filter(c => !c.id.startsWith('mentoria-'));
         } catch (e) {
           console.warn("Failed to fetch courses", e);
           ALL_AVAILABLE_COURSES_CACHE = [];
         }
      }

      // Render purchased products checkboxes dynamically
      const container = document.getElementById('edit-purchased-products');
      const purchased = student.purchasedProducts || student.enrolledProducts || [];
      
      if (ALL_AVAILABLE_COURSES_CACHE.length > 0) {
        container.innerHTML = ALL_AVAILABLE_COURSES_CACHE.map(course => {
          const isChecked = purchased.includes(course.id) ? 'checked' : '';
          // Decorate club vs standalone
          const badge = course.accessTier === 'all_access' ? '<span class="ml-1 text-[9px] bg-blue-100 text-blue-700 px-1 rounded">Club</span>' : '<span class="ml-1 text-[9px] bg-amber-100 text-amber-700 px-1 rounded">Avulso</span>';
          return \`
            <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 cursor-pointer">
              <input type="checkbox" name="edit-purchased" value="\${course.id}" class="rounded text-amber-600 focus:ring-amber-500" \${isChecked}>
              <span class="font-bold text-slate-800 text-[11px] leading-tight flex-1">\${course.title} \${badge}</span>
            </label>
          \`;
        }).join('');
      } else {
         container.innerHTML = '<p class="text-xs text-slate-500 p-2">Nenhum curso carregado.</p>';
      }

      document.getElementById('edit-student-modal').classList.remove('hidden');
    }`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('admin-alunos.html', content);
console.log("Patched openEditStudentModal");
