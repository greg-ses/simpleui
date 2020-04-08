
ansible-playbook -i hosts --become --ask-become-pass push_colsets.yml --limit PURE_SIMS

ansible-playbook -i hosts --become --ask-become-pass push_colsets.yml --limit PURE_PRODUCTION

