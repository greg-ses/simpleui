
ansible-playbook -i hosts --become --ask-become-pass push_sitesvc.yml

ansible-playbook -i hosts --become --ask-become-pass push_colsets.yml
